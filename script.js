'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: 'Steven Thomas Williams',
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: 'Zukhriddinbek Ganiev',
  movements: [430, 1000, -300, 700, 50, 90, -460, 450.8],
  interestRate: 1,
  pin: 2000,
  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2020-07-11T23:36:17.929Z',
    '2020-07-12T10:51:36.790Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

const displayMovement = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const day = `${date.getDate()}`.padStart(2, 0); // we want 2 characters long, with 0 in start
    const month = `${date.getMonth() + 1}`.padStart(2, 0);
    const year = date.getFullYear();
    const displayDate = `${day}/${month}/${year}`;
    const html = `      
    <div class="movements">
      <div class="movements__row">
      <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
      <div class="movements__date">${displayDate}</div>
      <div class="movements__value">${mov.toFixed(2)}€</div>
    </div>`;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

// example
const createUserNames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(word => word[0])
      .join('');
  });
};
createUserNames(accounts);

const calDisplaySummary = function (acc) {
  const income = acc.movements
    .filter(val => val > 0)
    .reduce((acc, val) => acc + val, 0);

  const outCome = acc.movements
    .filter(val => val < 0)
    .reduce((acc, val) => acc + val, 0);

  const interest = acc.movements
    .filter(val => val > 0)
    .map((val, index) => (val * acc.interestRate) / 100)
    .filter(val => val >= 1)
    .reduce((acc, val) => acc + val, 0);

  labelSumIn.textContent = `${income}€`;
  labelSumOut.textContent = `${Math.abs(outCome)}€`;
  labelSumInterest.textContent = `${interest}€`;
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce(function (acc, value, i) {
    return acc + value;
  }, 0);

  labelBalance.textContent = `${acc.balance}€`;
};

// const init = username  .map(function (word) {
//   return word[0];
// });
// const initialUser = init.join('');

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// function to upda ui
const updateUI = function (acc) {
  displayMovement(acc);

  // display balance
  calcDisplayBalance(acc);

  // display summary
  calDisplaySummary(acc);
};

// TIMER
const startLogOutTimer = function () {
  const tick = function () {
    // in each call, print the ramining time to UI
    const minutes = String(Math.trunc(timer / 60)).padStart(2, 0);
    const seconds = String(timer % 60).padStart(2, 0);
    labelTimer.textContent = `${minutes}:${seconds}`;

    // when 0 seconds, log out the user
    if (timer === 0) {
      clearInterval(interval);
      labelWelcome.textContent = `Log in to get started!`;
      containerApp.style.opacity = 0;
    }
    // decrrease the timer
    timer--;
  };
  // Set time to 5 minutes
  let timer = 300;

  // Call the timer every seconds
  tick();
  const interval = setInterval(tick, 1000);
  return interval;
};

// event handler FOR LOGIN BUTTON
let currentAccount, timer;

btnLogin.addEventListener('click', function (e) {
  // prevent form from submitting and reloading the page
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);
  if (currentAccount?.pin === Number(inputLoginPin.value)) {
    // display UI and welcome message
    labelWelcome.textContent = `Welcome Back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // timer
    if (timer) {
      clearInterval(timer);
    }
    timer = startLogOutTimer();

    // Current Date
    const now = new Date();
    const day = `${now.getDate()}`.padStart(2, 0); // we want 2 characters long, with 0 in start
    const month = `${now.getMonth() + 1}`.padStart(2, 0);
    const year = now.getFullYear();
    const hour = `${now.getHours()}`.padStart(2, 0);
    const minutes = `${now.getMinutes()}`.padStart(2, 0);
    labelDate.textContent = `${day}/${month}/${year}, ${hour}:${minutes}`;

    //clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur(); // loses the focus loses the cursor from blinking

    // display movements update ui
    updateUI(currentAccount);
    console.log('LOGGED IN');
  }
});

// EVENT HANDLER FOR TRANSFER BUTTON
btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = Number(inputTransferAmount.value);
  const receiverAccount = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  if (
    amount > 0 &&
    receiverAccount &&
    currentAccount.balance >= amount &&
    receiverAccount?.username !== currentAccount.username
  ) {
    // transfer adding amount to receiver and adding withdrawal to sender
    currentAccount.movements.push(-amount);
    receiverAccount.movements.push(amount);

    //reset timer
    clearInterval(timer);
    timer = startLogOutTimer();

    // add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAccount.movementsDates.push(new Date().toISOString());

    updateUI(currentAccount);
  }
  inputTransferTo.value = inputTransferAmount.value = '';
  inputTransferTo.blur();
  inputTransferAmount.blur();
});

// EVENT HANDLER FOR BUTTON LOAN
btnLoan.addEventListener('click', function (e) {
  e.preventDefault();
  const loanAmount = Number(inputLoanAmount.value);
  if (
    loanAmount > 0 &&
    currentAccount.movements.some(acc => acc >= (loanAmount * 10) / 100)
  ) {
    // reset timer
    clearInterval(timer);
    timer = startLogOutTimer();

    setTimeout(function () {
      currentAccount.movements.push(loanAmount);

      // adding dates to loan
      currentAccount.movementsDates.push(new Date().toISOString());

      updateUI(currentAccount);
    }, 2500);
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
  // labelWelcome.textContent = 'Log in to get started';
});

// EVENT HANDLER FOR CLOSING ACCOUNT
btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    Number(inputClosePin.value) === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      // unlike find() returns value itself but findIndex() returns the index of that value in an array
      acc => acc.username === currentAccount.username
    );
    // delete account
    console.log(index);
    console.log('ACCOUNT WAS DELETED');
    labelWelcome.textContent = `Your account was deleted!`;
    accounts.splice(index, 1);
    // hide UI
    containerApp.style.opacity = 0;
  }
  inputCloseUsername.value = inputClosePin.value = '';
  // inputCloseUsername.blur();
  // inputClosePin.blur();
});

// BTN SORT
let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovement(currentAccount, !sorted);
  sorted = !sorted;
});

// currencies
const currencies = new Map([
  ['USD', 'United States dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'Pound sterling'],
]);

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

/////////////////////////////////////////////////

// arays
/*
let ar = ['a', 'b', 'c', 'd', 'e'];

// slice
console.log(ar.slice(2));
console.log(ar.slice(2, 4)); // 4 - 2 = 2 means only 2 words it will return
console.log(ar.slice(-2)); // ['d', 'e']
console.log(ar.slice(-1)); // ['e']
console.log(ar.slice()); // ['a', 'b', 'c', 'd', 'e'] // returns shallow copy of original array
console.log(ar.slice([...ar])); //['a', 'b', 'c', 'd', 'e'] // returns shallow copy of original array

// splice
// console.log(ar.splice(2)); // splice is taking these elements away from the array like deleting it
ar.splice(-1);
console.log(ar);
ar.splice(1, 2);
console.log(ar);

// REVERSE
ar = ['a', 'b', 'c', 'd', 'e'];
const arr2 = ['j', 'i', 'h', 'g', 'f'];
console.log(arr2.reverse()); // mutates original array
console.log(arr2); // original array is reversed too

// concat
const alphabet = ar.concat(arr2); //
console.log(alphabet);
console.log([...ar, ...arr2]); // exact same result

// join
const jl = alphabet.join('-'); // single array
console.log(jl);
*/
/*
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

for (const [i, movement] of movements.entries()) {
  if (movement > 0) {
    console.log(`Movement ${i + 1}: You have deposited ${movement}`);
  } else {
    console.log(`Movement ${i + 1}: You withdrew ${Math.abs(movement)}`); // method absolute to remove signs like -200 as 200
  }
}

console.log('-------- FOR EACH ---------');

movements.forEach(function (mov, i, arr) {
  // first current element, and second index
  if (mov > 0) {
    console.log(`Movement ${i + 1}: You have deposited ${mov}`);
  } else {
    console.log(`Movement ${i + 1}: You withdrew ${Math.abs(mov)}`);
  }
});

*/
///////////////////////////////////////
// Coding Challenge #1
/* 
Julia and Kate are doing a study on dogs. So each of them asked 5 dog owners about their dog's age, and stored the data into an array (one array for each). 
For now, they are just interested in knowing whether a dog is an adult or a puppy. 
A dog is an adult if it is at least 3 years old, and it's a puppy if it's less than 3 years old.

Create a function 'checkDogs', which accepts 2 arrays of dog's ages ('dogsJulia' and 'dogsKate'), and does the following things:

1. Julia found out that the owners of the FIRST and the LAST TWO dogs actually have cats, not dogs!
 So create a shallow copy of Julia's array, and remove the cat ages from that copied array (because it's a bad practice to mutate function parameters)
2. Create an array with both Julia's (corrected) and Kate's data
3. For each remaining dog, log to the console whether it's an adult ("Dog number 1 is an adult, and is 5 years old") or a puppy ("Dog number 2 is still a puppy 🐶")
4. Run the function for both test datasets

HINT: Use tools from all lectures in this section so far 😉

TEST DATA 1: Julia's data [3, 5, 2, 12, 7], Kate's data [4, 1, 15, 8, 3]
TEST DATA 2: Julia's data [9, 16, 6, 8, 3], Kate's data [10, 5, 6, 1, 4]

GOOD LUCK 😀

let julia = [3, 5, 2, 12, 7];
let kate = [4, 1, 15, 8, 3];
const checkDogs = function (dogsJulia, dogsKate) {
  // let copyJulia = [...dogsJulia];
  // copyJulia.shift();
  // copyJulia.pop();
  // copyJulia.pop();
  const copyJulia = dogsJulia.slice();
  copyJulia.splice(0, 1);
  copyJulia.splice(-2);
  const corrected = copyJulia.concat(dogsKate);
  corrected.forEach(function (value, i) {
    // const str =
    //   value >= 3 ? `an adult, and is ${value} years old` : 'still a puppy 🐶';
    // console.log(`Dog number ${i + 1} is ${str}`);
    if (value >= 3) {
      console.log(`Dog number ${i + 1} is an adult, and is ${value} years old`);
    } else {
      console.log(`Dog number ${i + 1} is still a puppy 🐶`);
    }
  });
};

console.log(checkDogs(julia, kate));
*/

/*  MAP METHOD
const movements  = [200, 450, -400, 3000, -650, -130, 70, 1300];
const euroRate = 1.1;

// const moveUSD = movements.map(function (mov) {   // using call back function
//   return mov * euroRate;
// });

const moveUSD = movements.map(mov => mov * euroRate); // using arrow function

console.log(movements);
console.log(1.1);
console.log(moveUSD);

const ar = [];
for (const mov of movements) ar.push(mov * euroRate);
console.log(ar);

const moveDescrip = movements.map(
  (mov, i) =>
    `Movement ${i + 1}: You have ${
      mov > 0 ? 'deposited' : 'withdrew'
    } ${Math.abs(mov)}`
  /*
  if (mov > 0) {
    return `Movement ${i + 1}: You have deposited ${mov}`;
  } else {
    return `Movement ${i + 1}: You withdrew ${Math.abs(mov)}`; // method absolute to remove signs like -200 as 200
  }
);

console.log(moveDescrip);
*/

/*
// FILTER METHOD
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

const deposits = movements.filter(function (mov) {
  return mov > 0;
});

console.log(movements);
console.log(deposits);

// const ar = [];
// for (const mov of movements)
//   if (mov > 0) {
//     ar.push(mov);
//   }
// console.log(ar);

const withdrawals = movements.filter(mov => mov < 0);
console.log(withdrawals);


// REDUCE METHOD
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];

// ACCUMULATOR -> is like a SNOWBALL
// const balance = movements.reduce(function (acc, value, index, arr) {
//   // acc is like sum = 0; which we add to other values to get sum of several numbers
//   console.log(`Iteration ${index}: ${acc}`);
//   return acc + value; // in filte, forEach, map methods we do not normally use return function
// }, 0);
const balance = movements.reduce((acc, value, index, arr) => acc + value, 0);

console.log(balance);

// USING FOR OF LOOP
let sum = 0;
for (const [i, value] of movements.entries())
  console.log(`Iteration ${i}: ${(sum += value)}`);
console.log(sum);

// REDUCE finding the max number
const max = movements.reduce(function (acc, value, index, arr) {
  if (acc > value) {
    return acc;
  } else {
    return value;
  }
}, movements[0]);

console.log(max);
*/

// const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
// console.log(movements);

/*
Let's go back to Julia and Kate's study about dogs. This time, 
they want to convert dog ages to human ages and calculate the average age of the dogs in their study.

Create a function 'calcAverageHumanAge', which accepts an arrays of dog's ages ('ages'), and does the following things in order:

1. Calculate the dog age in human years using the following formula: if the dog is <= 2 years old, humanAge = 2 * dogAge. 
If the dog is > 2 years old, humanAge = 16 + dogAge * 4.
2. Exclude all dogs that are less than 18 human years old (which is the same as keeping dogs that are at least 18 years old)
3. Calculate the average human age of all adult dogs (you should already know from other challenges how we calculate averages 😉)
4. Run the function for both test datasets

TEST DATA 1: [5, 2, 4, 1, 15, 8, 3]
TEST DATA 2: [16, 6, 10, 5, 6, 1, 4]

GOOD LUCK 😀


// const dogsAge = [5, 2, 4, 1, 15, 8, 3];

// const calcAverageHumanAge = function (ages) {
//   const humanAge = ages.map(val => (val <= 2 ? 2 * val : 16 + val * 4));

//   const excludeDogs = humanAge.filter(val => val >= 18);

//   // const averageHumanAge =
//   //   excludeDogs.reduce((acc, val) => acc + val, 0) / excludeDogs.length;
//   const averageHumanAge = excludeDogs.reduce(
//     (acc, val, index, arr) => acc + val / arr.length,
//     0
//   );

//   return `Dogs in human ages: ${humanAge}, excludeDogs: ${excludeDogs}, averageHumanAge: ${averageHumanAge}`;
// };
// console.log(calcAverageHumanAge(dogsAge));

const dogsAge = [5, 2, 4, 1, 15, 8, 3];

const calcAverageHumanAge = ages => {
  const dogsConHuman = ages
    .map(val => (val <= 2 ? 2 * val : 16 + val * 4))
    .filter(val => val >= 18)
    .reduce((acc, val, index, arr) => acc + val / arr.length, 0);

  return dogsConHuman;
};
console.log(calcAverageHumanAge(dogsAge));

/*
// MAGIC OF CHAINING METHODS
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const euroRate = 1.1;
const totalDepositsUsd = movements
  .filter(mov => mov > 0)
  .map(mov => mov * euroRate)
  .reduce((acc, val) => acc + val, 0);
*/

/*
// FIND METHOD
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
const firstWithdrawal = movements.find(mov => mov < 0); // unlike filter array this return first element that true to the condition
console.log(movements);
console.log(firstWithdrawal); // -400

console.log(accounts);
const bekAccount = accounts.find(acc => acc.owner === 'Ganiev Zukhriddinbek');
console.log(bekAccount);
*/

/*
// SORT METHOD
const owners = ['jonas', 'bek', 'adam', 'martha'];
console.log(owners.sort()); // sort function mutates the original array
console.log(owners);

// ASCENDING ORDER
const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
console.log(movements);
movements.sort((a, b) => {
  if (a > b) {
    return 1;
  } else {
    return -1;
  }
});

// movements.sort((a, b) => a - b);

console.log(movements);
*/

/*
// ARRAY.FROM() FILL() 
const arr = [1, 2, 3, 4, 5, 6, 7]; // logs array of numbers
console.log(new Array(1, 2, 3, 4, 5, 6, 7)); // logs array of numbers

const x = new Array(7); // creates array with length of 7 with zero elements [empty × 7]
console.log(x);
console.log(x.map(() => 5)); // [empty × 7] same as above

x.fill(1); // mutates the actual array [1, 1, 1, 1, 1, 1, 1]
// x.fill(1, 3); // start filling the number 1 from the index of 3 [empty × 3, 1, 1, 1, 1]
x.fill(1, 3, 5); // start from index 3 and end at index 5, [empty × 3, 1, 1, empty × 2]
console.log(x);

arr.fill(23, 4, 6);
console.log(arr); // [1, 2, 3, 4, 23, 23, 7]

// ARRAY FROM  this one is cleaner from above methods
const y = Array.from({ length: 7 }, () => 1); // call back function
console.log(y);

const z = Array.from({ length: 7 }, (_, index) => index + 1); // _ = throw away parameter, if we dont use that parameter
console.log(z);


// create an array with 100 length with randomly generated dice rolls
// const hundredDiceRoll = Array.from({ length: 100 }, (ele, i) => {
//   const rand = Math.floor(Math.random() * 6) + 1;
//   return rand;
// });
// console.log(hundredDiceRoll);


labelBalance.addEventListener('click', function () {
  const movementUI = Array.from(
    document.querySelectorAll('.movements__value'),
    el => Number(el.textContent.replace('€', ''))
  );
  console.log(movementUI);
});
*/

/* 
CODING CHALLENGE #4
Julia and Kate are still studying dogs, and this time they are studying if dogs are eating too much or too little.
Eating too much means the dog's current food portion is larger than the recommended portion, and eating too little is the opposite.
Eating an okay amount means the dog's current food portion is within a range 10% above and 10% below the recommended portion (see hint).

1.Loop over the array containing dog objects, and for each dog, calculate the recommended food portion and add it to the object as a new property. 
  Do NOT create a new array, simply loop over the array. 
  Forumla: recommendedFood = weight ** 0.75 * 28. (The result is in grams of food, and the weight needs to be in kg)
2.Find Sarah's dog and log to the console whether it's eating too much or too little. HINT: Some dogs have multiple owners, 
  so you first need to find Sarah in the owners array, and so this one is a bit tricky (on purpose) 🤓
3.Create an array containing all owners of dogs who eat too much ('ownersEatTooMuch') and 
  an array with all owners of dogs who eat too little ('ownersEatTooLittle').
4.Log a string to the console for each array created in 3., 
  like this: "Matilda and Alice and Bob's dogs eat too much!" and "Sarah and John and Michael's dogs eat too little!"
5.Log to the console whether there is any dog eating EXACTLY the amount of food that is recommended (just true or false)
6.Log to the console whether there is any dog eating an OKAY amount of food (just true or false)
7.Create an array containing the dogs that are eating an OKAY amount of food (try to reuse the condition used in 6.)
8.Create a shallow copy of the dogs array and sort it by recommended 
  food portion in an ascending order (keep in mind that the portions are inside the array's objects)

HINT 1: Use many different tools to solve these challenges, you can use the summary lecture to choose between them 😉
HINT 2: Being within a range 10% above and below the recommended portion means: current > (recommended * 0.90) && current < (recommended * 1.10). 
        Basically, the current portion should be between 90% and 110% of the recommended portion.

TEST DATA:
const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] }
];

GOOD LUCK 😀

const dogs = [
  { weight: 22, curFood: 250, owners: ['Alice', 'Bob'] },
  { weight: 8, curFood: 200, owners: ['Matilda'] },
  { weight: 13, curFood: 275, owners: ['Sarah', 'John'] },
  { weight: 32, curFood: 340, owners: ['Michael'] },
];

// 1 create recommendedFood element inside original element
dogs.forEach(element => {
  element.recommendedFood = Math.trunc(element.weight ** 0.75 * 28);
});
console.log(dogs);

// 2 find Sarah's dog and log it to console whether it is eating too much or too little

// const DogSarah = dogs.find(ele => ele.owners.find(el => el === 'Sarah'));
const DogSarah = dogs.find(ele => ele.owners.includes('Sarah'));
if (DogSarah.curFood < DogSarah.recommendedFood) {
  console.log(`Sarah's dog is eating too little`);
} else if (DogSarah.curFood > DogSarah.recommendedFood) {
  console.log(`Sarah's dog is eating too much`);
}

// 3 create array eating too much and eating too little
const ownersEatTooMuch = dogs
  .filter((element, _) => element.curFood > element.recommendedFood)
  .map(dog => dog.owners)
  .flat();
const ownersEatTooLittle = dogs
  .filter((element, _) => element.curFood < element.recommendedFood)
  .map(dog => dog.owners)
  .flat();

// 4 log to the console according to step three
console.log(`${ownersEatTooMuch.join(' and ')} dogs eat too much`);
console.log(`${ownersEatTooLittle.join(' and ')} dogs eat too little`);

// 5 return if curFood is equal to recommedFood
console.log(dogs.some(dog => dog.curFood === dog.recommendedFood));

// 6 return true or false if any dog is eating ok
console.log(
  dogs.some(
    dog =>
      dog.curFood > dog.recommendedFood * 0.9 &&
      dog.curFood < dog.recommendedFood * 1.1
  )
);

// 7
const ownersEatOkay = dogs.filter(
  (el, _) =>
    el.curFood > el.recommendedFood * 0.9 &&
    el.curFood < el.recommendedFood * 1.1
);
console.log(ownersEatOkay);

// 8 sort in ascending order
const shallowDog = dogs
  .slice()
  .sort((a, b) => a.recommendedFood - b.recommendedFood);
console.log(shallowDog);
*/

// NUMBERS< DATES<
// conversion
// console.log(23 === 23.0);
// console.log(Number('23')); // string to number

// // parsing
// console.log(+'23'); // string to number
// console.log(23 + ''); // number to string
// console.log(Number.parseInt('30px', 10)); // string needs to start with a number / 10 means base 10 system from 0 - 9
// console.log(Number.parseInt('e23')); // NaN
// console.log(Number.parseFloat('2.5')); // 2.5
// console.log(Number.parseInt('2.5')); // 2

// console.log(Number.isNaN(20)); // false
// console.log(Number.isNaN('20')); // false
// console.log(Number.isNaN(+'20')); // true beacause it is not a number

// // best to check if sth is a number
// console.log(Number.isFinite(23)); // true
// console.log(Number.isFinite('23')); // false

// // REMAINDER OPERATOR
// console.log(5 % 2); // 1
// console.log(5 / 2); // 2.5

/*
// CREATING DATES
const now = new Date();
console.log(now); // Thu Mar 17 2022 20:17:36 GMT+0900 (Korean Standard Time)
console.log(new Date('Mar 17 2022 20:17:36')); // Thu Mar 17 2022 20:17:36 GMT+0900 (Korean Standard Time)

console.log(new Date(account4.movementsDates[0]));
console.log(new Date(2023, 9, 17, 15, 23, 31));

console.log(new Date(0)); // we can pass milliseconds = Thu Jan 01 1970 09:00:00 GMT+0900 (Korean Standard Time)
console.log(new Date(3 * 24 * 60 * 60 * 1000)); //Sun Jan 04 1970 09:00:00 GMT+0900 (Korean Standard Time)
*/

/*
// WORKING WITH DATES
const future = new Date(2023, 9, 17, 15, 23); // Tue Oct 17 2023 15:23:00 GMT+0900 (Korean Standard Time)
console.log(future);

console.log(future.getFullYear()); // 2023
console.log(future.getMonth()); // zero based which is october = 9
console.log(future.getDate()); // date 17
console.log(future.getDay()); // day of the week = 2 which is (Tue)
console.log(future.getHours()); // 15 hour
console.log(future.getMinutes()); // 23 minutes
console.log(future.getSeconds()); // seconds 00

console.log(future.toISOString()); // world standard to show date = 2023-10-17T06:23:00.000Z

console.log(future.getTime()); // this will give milliseconds from when it started = 1697523780000
console.log(new Date(1697523780000)); // Tue Oct 17 2023 15:23:00 GMT+0900 (Korean Standard Time)

console.log(Date.now()); // this will give us current time stamp which is milliseconds
As of 18/03/2022, 19:56
const now = new Date();
console.log(`As of ${now.getDate()}/${now.getMonth()}/${now.getFullYear()}, ${now.getHours()}:${now.getMinutes()}`)

*/

/*
// TIMERS: setTimeOut and setInterval
const ingredints = ['sausage', 'red'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your Pizza with ${ing1} and ${ing2}🍕`),
  3000,
  ...ingredints
);
console.log('waiting...');

if (ingredints.includes('spinach')) {
  clearTimeout(pizzaTimer);
}

// setInterval()
setInterval(() => {
  const now = new Date();
  const hour = now.getHours();
  const minutes = `${now.getMinutes()}`.padStart(2, 0);
  const seconds = `${now.getSeconds()}`.padStart(2, 0);
  console.log(`${hour}:${minutes}:${seconds}`);
}, 1000);
*/
