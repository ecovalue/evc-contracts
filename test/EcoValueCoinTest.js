const EcoValueCoin = artifacts.require("./EcoValueCoin.sol");

let owner;
let user1;

let decimals = 18;
let totalSupply = web3.toWei(3300000000, 'ether');

contract('EcoValueCoin', (accounts) => {

    before(async () => {
        owner = accounts[0];
        user1 = accounts[1];
        user2 = accounts[2];
    });

    it("Fresh contract has correct initial values", async () => {
        let contract = await EcoValueCoin.new();

        assert("Eco Value Coin" == await contract.name.call(), "name matches");
        assert("EVC" == await contract.symbol.call(), "symbol matches");
        assert(decimals == (await contract.decimals.call()).toNumber(), "decimals matches"); 
        assert(totalSupply == (await contract.totalSupply.call()).toNumber(), "totalSupply matches");
        assert(totalSupply == (await contract.balances.call(owner)).toNumber(), "owner has all tokens");
        assert(await contract.transferGrants.call(owner), "owner can transfer");
    });

    it("Owner can transfer the tokens but others cant unless specifically granted", async () => {
        let contract = await EcoValueCoin.new();
        let user1TokenBalanceBefore = (await contract.balanceOf.call(user1)).toNumber();
        let user2TokenBalanceBefore = (await contract.balanceOf.call(user2)).toNumber();

        assert(await contract.transferGrants.call(owner), "owner can transfer");
        assert(!(await contract.transferGrants.call(user1)), "user1 cannot transfer");

        await contract.transfer(user1, 1000);
        await contract.transfer(user2, 1000);

        //user1 can't transfer
        try {
            await contract.transfer(owner, 1000, {from: user1});
        } catch (e) {
            //expected
        }
        let user1TokenBalanceAfter = (await contract.balanceOf.call(user1)).toNumber();
        assert(user1TokenBalanceAfter == 1000 + user1TokenBalanceBefore, "user1 balance still the same");

        //user2 can transfer
        await contract.grantTransferRight(user2);
        assert(await contract.transferGrants.call(user2), "user2 can transfer");
        await contract.transfer(owner, 500, {from: user2});
        let user2TokenBalanceAfter1 = (await contract.balanceOf.call(user2)).toNumber();
        assert(user2TokenBalanceAfter1 == 500 + user2TokenBalanceBefore, "user2 balance should be 500");

        //user2 cant transfer anymore
        await contract.cancelTransferRight(user2);
        assert(!(await contract.transferGrants.call(user2)), "user2 can transfer");
        try {
            await contract.transfer(owner, 500, {from: user2});
        } catch (e) {
            //expected
        }
        let user2TokenBalanceAfter2 = (await contract.balanceOf.call(user2)).toNumber();
        assert(user2TokenBalanceAfter2 == 500 + user2TokenBalanceBefore, "user2 balance should still be 500");
    });
});



