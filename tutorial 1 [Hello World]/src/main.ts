import { Square } from './src/Square.js';
import {
    isReady,
    shutdown,
    Field,
    Mina,
    PrivateKey,
    AccountUpdate,
} from 'snarkyjs';



(async function main() {
    await isReady;
    console.log('SnarkyJS loaded')
    const Local = Mina.LocalBlockchain();
    Mina.setActiveInstance(Local);

    const deployerAccount = Local.testAccounts[0].privateKey;
    // ----------------------------------------------------
    // Create a public/private key pair. The public key is our address and where we will deploy to
    const zkAppPrivateKey = PrivateKey.random();
    const zkAppAddress = zkAppPrivateKey.toPublicKey();
    // Create an instance of our Square smart contract and deploy it to zkAppAddress
    const contract = new Square(zkAppAddress);
    const deployTxn = await Mina.transaction(deployerAccount, () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        contract.deploy({ zkappKey: zkAppPrivateKey });
        contract.sign(zkAppPrivateKey);
    });
    await deployTxn.send();
    // Get the initial state of our zkApp account after deployment
    const num0 = contract.num.get();
    console.log('state after init:', num0.toString());
    // ----------------------------------------------------

    const txn1 = await Mina.transaction(deployerAccount, () => {
        contract.update(Field(9));
        contract.sign(zkAppPrivateKey);
    });
    await txn1.send();
    const num1 = contract.num.get();

    console.log('state after txn1:', num1.toString());
    // ----------------------------------------------------
    try {
        const txn2 = await Mina.transaction(deployerAccount, () => {
            contract.update(Field(81));
            contract.sign(zkAppPrivateKey);
        });
        await txn2.send();
    } catch (err: any) {
        console.log(err.message);
    }
    const num2 = contract.num.get();
    console.log('state after txn2:', num2.toString());
    // ----------------------------------------------------
    try {
        const txn3 = await Mina.transaction(deployerAccount, () => {
            contract.update(Field(243));
            contract.sign(zkAppPrivateKey);
        });
        await txn3.send();
    } catch (err: any) {
        console.log(err.message);
    }
    const num3 = contract.num.get();
    console.log('state after txn3:', num3.toString());
    // ----------------------------------------------------

    console.log('Shutting down')
})();
