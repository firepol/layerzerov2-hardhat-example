// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import { OFT } from "@layerzerolabs/lz-evm-oapp-v2/contracts/oft/OFT.sol";

contract OftCoin is OFT {
    constructor(
        string memory _name,
        string memory _symbol,
        address _layerZeroEndpoint,
        address _owner,
        uint256 _supply
    ) OFT(_name, _symbol, _layerZeroEndpoint, _owner) {
        _mint(_owner, _supply);
    }
}