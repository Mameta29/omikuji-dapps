// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/OmikujiNFT.sol";

contract DeployOmikuji is Script {
    function run() external {
        // プライベートキーの取得
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // JPYCのコントラクトアドレス
        address jpycAddress;

        // チェーンIDに基づいてJPYCアドレスを設定
        if (block.chainid == 1) {
            // Ethereum Mainnet
            jpycAddress = address(0x2370f9d504c7a6E775bf6E14B3F12846b594cD53);
        } else if (block.chainid == 137) {
            // Polygon Mainnet
            jpycAddress = address(0x6AE7Dfc73E0dDE2aa99ac063DcF7e8A63265108c);
        } else {
            revert("Unsupported network");
        }

        vm.startBroadcast(deployerPrivateKey);

        // おみくじコントラクトのデプロイ
        OmikujiNFT omikuji = new OmikujiNFT(jpycAddress);

        vm.stopBroadcast();

        console.log("Omikuji contract deployed to:", address(omikuji));
    }
}
