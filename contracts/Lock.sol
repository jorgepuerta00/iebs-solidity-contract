// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.1;

contract Lock {
    uint public unlockTime;
    address payable public owner;

    event Withdrawal(uint amount, uint when);
    event LockExtended(uint newUnlockTime);

    constructor(uint _unlockTime) payable {
        require(block.timestamp < _unlockTime, "Unlock time should be in the future");
        unlockTime = _unlockTime;
        owner = payable(msg.sender);
    }

    function withdraw() public {
        require(block.timestamp >= unlockTime, "You can't withdraw yet");
        require(msg.sender == owner, "You aren't the owner");
        emit Withdrawal(address(this).balance, block.timestamp);
        owner.transfer(address(this).balance);
    }

    function extendLock(uint newUnlockTime) public {
        require(newUnlockTime > unlockTime, "New unlock time should be in the future");
        require(newUnlockTime - unlockTime <= 365 days, "Lock extension can't exceed 1 year");
        require(msg.sender == owner, "You aren't the owner");
        unlockTime = newUnlockTime;
        emit LockExtended(unlockTime);
    }
}
