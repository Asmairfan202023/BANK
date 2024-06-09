// index.ts
import { faker } from '@faker-js/faker';
import inquirer from 'inquirer';

// BankAccount Interface
interface IBankAccount {
    balance: number;
    debit(amount: number): string;
    credit(amount: number): string;
    checkBalance(): number;
}

// BankAccount Class
class BankAccount implements IBankAccount {
    balance: number;

    constructor(initialBalance: number = 0) {
        this.balance = initialBalance;
    }

    debit(amount: number): string {
        if (this.balance < amount) {
            return `Transaction cancelled. Insufficient balance. Current balance: $${this.balance}`;
        }
        this.balance -= amount;
        return `Debited $${amount}. New balance: $${this.balance}`;
    }

    credit(amount: number): string {
        this.balance += amount;
        if (amount > 100) {
            this.balance -= 1; // Deduct $1 if more than $100 is credited
            return `Credited $${amount}. $1 fee deducted. New balance: $${this.balance}`;
        }
        return `Credited $${amount}. New balance: $${this.balance}`;
    }

    checkBalance(): number {
        return this.balance;
    }
}

// Customer Class
class Customer {
    firstName: string;
    lastName: string;
    age: number;
    mobileNumber: number;
    bankAccount: IBankAccount;

    constructor(firstName: string, lastName: string, age: number, mobileNumber: number, bankAccount: IBankAccount) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.age = age;
        this.mobileNumber = mobileNumber;
        this.bankAccount = bankAccount;
    }
}

// Generate customers with fake data
const generateCustomers = (numCustomers: number): Customer[] => {
    const customers: Customer[] = [];
    for (let i = 0; i < numCustomers; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const age = faker.number.int({ min: 18, max: 70 });
        let mobileNumber =parseInt(faker.string.numeric('3##-########'));
        const bankAccount = new BankAccount(faker.number.int({ min: 100, max: 1000 }));

        customers.push(new Customer(firstName, lastName, age, mobileNumber, bankAccount));
    }
    return customers;
};

// Main function
const main = async () => {
    const customers = generateCustomers(10);

    const customerChoices = customers.map((customer, index) => ({
        name: `${customer.firstName} ${customer.lastName}`,
        value: index
    }));

    const { selectedCustomerIndex } = await inquirer.prompt([
        {
            type: 'list',
            name: 'selectedCustomerIndex',
            message: 'Select a customer:',
            choices: customerChoices
        }
    ]);

    const customer = customers[selectedCustomerIndex];
    console.log(`Welcome ${customer.firstName} ${customer.lastName} to the Bank App!`);

    const promptLoop = async () => {
        const answers = await inquirer.prompt([
            {
                type: 'list',
                name: 'action',
                message: 'What would you like to do?',
                choices: ['Check Balance', 'Credit Money', 'Debit Money', 'Exit']
            },
            {
                type: 'input',
                name: 'amount',
                message: 'Enter the amount:',
                when: (answers) => answers.action !== 'Check Balance' && answers.action !== 'Exit',
                validate: (value) => {
                    const valid = !isNaN(parseFloat(value));
                    return valid || 'Please enter a number';
                },
                filter: Number
            }
        ]);

        switch (answers.action) {
            case 'Check Balance':
                console.log(`Your current balance is: $${customer.bankAccount.checkBalance()}`);
                break;
            case 'Credit Money':
                console.log(customer.bankAccount.credit(answers.amount));
                break;
            case 'Debit Money':
                console.log(customer.bankAccount.debit(answers.amount));
                break;
            case 'Exit':
                console.log('Thank you for using the Bank App!');
                return;
        }

        await promptLoop();
    };

    await promptLoop();
};

main();
