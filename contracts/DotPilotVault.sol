// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DotPilotVault is AccessControl, Pausable, ReentrancyGuard {
    using Address for address payable;
    using SafeERC20 for IERC20;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant STRATEGY_MANAGER_ROLE = keccak256("STRATEGY_MANAGER_ROLE");
    bytes32 public constant REWARD_MANAGER_ROLE = keccak256("REWARD_MANAGER_ROLE");

    struct Strategy {
        uint256 id;
        bytes32 strategyKey;
        address asset;
        bool isNative;
        bool active;
        uint16 riskScore;
    }

    struct Position {
        uint256 id;
        address user;
        uint256 strategyId;
        address asset;
        uint256 deposited;
        uint256 rewards;
        uint64 openedAt;
        uint64 closedAt;
        bool isNative;
        bool active;
    }

    error InvalidAdmin();
    error InvalidAmount();
    error InvalidAssetConfiguration();
    error InvalidStrategyKey();
    error NativeStrategyOnly(uint256 strategyId);
    error TokenStrategyOnly(uint256 strategyId);
    error NativeValueRequired();
    error UnexpectedNativeValue();
    error StrategyInactive(uint256 strategyId);
    error StrategyNotFound(uint256 strategyId);
    error PositionClosed(uint256 positionId);
    error PositionNotFound(uint256 positionId);
    error PositionNotOwned(uint256 positionId, address caller);

    event StrategyCreated(
        uint256 indexed strategyId,
        bytes32 indexed strategyKey,
        address indexed asset,
        bool isNative,
        uint16 riskScore
    );
    event StrategyStatusUpdated(uint256 indexed strategyId, bool active);
    event Deposited(address indexed user, uint256 indexed strategyId, uint256 amount);
    event Withdrawn(address indexed user, uint256 indexed positionId, uint256 amount);
    event RewardsCredited(uint256 indexed positionId, uint256 amount);

    uint256 public nextStrategyId = 1;
    uint256 public nextPositionId = 1;

    mapping(uint256 => Strategy) private strategies;
    mapping(uint256 => Position) private positions;
    mapping(address => uint256[]) private userPositionIds;

    constructor(address admin) {
        if (admin == address(0)) {
            revert InvalidAdmin();
        }

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(STRATEGY_MANAGER_ROLE, admin);
        _grantRole(REWARD_MANAGER_ROLE, admin);
    }

    function createStrategy(
        bytes32 strategyKey,
        address asset,
        bool isNative,
        uint16 riskScore
    ) external onlyRole(STRATEGY_MANAGER_ROLE) returns (uint256 strategyId) {
        if (strategyKey == bytes32(0)) {
            revert InvalidStrategyKey();
        }
        if (isNative && asset != address(0)) {
            revert InvalidAssetConfiguration();
        }
        if (!isNative && asset == address(0)) {
            revert InvalidAssetConfiguration();
        }

        strategyId = nextStrategyId++;
        strategies[strategyId] = Strategy({
            id: strategyId,
            strategyKey: strategyKey,
            asset: asset,
            isNative: isNative,
            active: true,
            riskScore: riskScore
        });

        emit StrategyCreated(strategyId, strategyKey, asset, isNative, riskScore);
    }

    function setStrategyStatus(
        uint256 strategyId,
        bool active
    ) external onlyRole(STRATEGY_MANAGER_ROLE) {
        Strategy storage strategyData = _getStrategy(strategyId);
        strategyData.active = active;
        emit StrategyStatusUpdated(strategyId, active);
    }

    function deposit(
        uint256 strategyId
    ) external payable whenNotPaused nonReentrant returns (uint256 positionId) {
        Strategy storage strategyData = _getActiveStrategy(strategyId);

        if (!strategyData.isNative) {
            revert TokenStrategyOnly(strategyId);
        }
        if (msg.value == 0) {
            revert NativeValueRequired();
        }

        positionId = _createPosition(msg.sender, strategyData, msg.value);
        emit Deposited(msg.sender, strategyId, msg.value);
    }

    function depositToken(
        uint256 strategyId,
        uint256 amount
    ) external whenNotPaused nonReentrant returns (uint256 positionId) {
        Strategy storage strategyData = _getActiveStrategy(strategyId);

        if (strategyData.isNative) {
            revert NativeStrategyOnly(strategyId);
        }
        if (amount == 0) {
            revert InvalidAmount();
        }

        IERC20(strategyData.asset).safeTransferFrom(msg.sender, address(this), amount);
        positionId = _createPosition(msg.sender, strategyData, amount);
        emit Deposited(msg.sender, strategyId, amount);
    }

    function creditRewards(
        uint256 positionId,
        uint256 amount
    ) external payable onlyRole(REWARD_MANAGER_ROLE) whenNotPaused nonReentrant {
        Position storage positionData = _getOpenPosition(positionId);

        if (amount == 0) {
            revert InvalidAmount();
        }

        if (positionData.isNative) {
            if (msg.value != amount) {
                revert InvalidAmount();
            }
        } else {
            if (msg.value != 0) {
                revert UnexpectedNativeValue();
            }
            IERC20(positionData.asset).safeTransferFrom(msg.sender, address(this), amount);
        }

        positionData.rewards += amount;
        emit RewardsCredited(positionId, amount);
    }

    function withdraw(
        uint256 positionId
    ) external whenNotPaused nonReentrant returns (uint256 payout) {
        Position storage positionData = _getOpenPosition(positionId);

        if (positionData.user != msg.sender) {
            revert PositionNotOwned(positionId, msg.sender);
        }

        payout = positionData.deposited + positionData.rewards;
        positionData.active = false;
        positionData.closedAt = uint64(block.timestamp);

        if (positionData.isNative) {
            payable(msg.sender).sendValue(payout);
        } else {
            IERC20(positionData.asset).safeTransfer(msg.sender, payout);
        }

        emit Withdrawn(msg.sender, positionId, payout);
    }

    function getStrategy(uint256 strategyId) external view returns (Strategy memory) {
        return _getStrategy(strategyId);
    }

    function getPosition(
        address user
    ) external view returns (Position[] memory userPositions) {
        uint256[] storage ids = userPositionIds[user];
        userPositions = new Position[](ids.length);

        for (uint256 index = 0; index < ids.length; index++) {
            userPositions[index] = positions[ids[index]];
        }
    }

    function getPositionById(
        uint256 positionId
    ) external view returns (Position memory) {
        return _getPosition(positionId);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function _createPosition(
        address user,
        Strategy storage strategyData,
        uint256 amount
    ) internal returns (uint256 positionId) {
        positionId = nextPositionId++;

        positions[positionId] = Position({
            id: positionId,
            user: user,
            strategyId: strategyData.id,
            asset: strategyData.asset,
            deposited: amount,
            rewards: 0,
            openedAt: uint64(block.timestamp),
            closedAt: 0,
            isNative: strategyData.isNative,
            active: true
        });

        userPositionIds[user].push(positionId);
    }

    function _getStrategy(
        uint256 strategyId
    ) internal view returns (Strategy storage strategyData) {
        strategyData = strategies[strategyId];
        if (strategyData.id == 0) {
            revert StrategyNotFound(strategyId);
        }
    }

    function _getActiveStrategy(
        uint256 strategyId
    ) internal view returns (Strategy storage strategyData) {
        strategyData = _getStrategy(strategyId);
        if (!strategyData.active) {
            revert StrategyInactive(strategyId);
        }
    }

    function _getPosition(
        uint256 positionId
    ) internal view returns (Position storage positionData) {
        positionData = positions[positionId];
        if (positionData.id == 0) {
            revert PositionNotFound(positionId);
        }
    }

    function _getOpenPosition(
        uint256 positionId
    ) internal view returns (Position storage positionData) {
        positionData = _getPosition(positionId);
        if (!positionData.active) {
            revert PositionClosed(positionId);
        }
    }
}
