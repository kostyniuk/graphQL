'use strict';

module.exports = {
  getUsers: async (args, req) => {
    return [{
      id: 1,
      nickname: 'alex',
      firstName: 'Alex',
      lastName: 'Kostyniuk',
      number: '066132451',
      email: 'asddas@dkal.com',
      password: 'asdasd'
    }, 
    {
      id: 2,
      nickname: 'dloading',
      firstName: 'D\'Angelo',
      lastName: 'Russell',
      number: '037421902',
      email: 'df@ike.nr',
      password: '132321'
    }]
  }
}