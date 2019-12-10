'use strict';

module.exports = {
  getUsers: async (args, req) => {
    return [{
      id: 1,
      nickname: 'alex',
      firstName: 'Alex',
      lastName: 'Kostyniuk',
      number: '066132451',
    }, 
    {
      id: 2,
      nickname: 'dloading',
      firstName: 'D\'Angelo',
      lastName: 'Russell',
      number: '037421902',
    }]
  }
}