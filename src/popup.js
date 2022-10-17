'use strict';

import './popup.css';

(function () {
  // We will make use of Storage API to get and store `count` value
  // More information on Storage API can we found at
  // https://developer.chrome.com/extensions/storage

  // To get storage access, we have to mention it in `permissions` property of manifest.json file
  // More information on Permissions can we found at
  // https://developer.chrome.com/extensions/declare_permissions
  const counterStorage = {
    get: (cb) => {
      chrome.storage.sync.get(['count'], (result) => {
        cb(result.count);
      });
    },
    set: (value, cb) => {
      chrome.storage.sync.set(
        {
          count: value,
        },
        () => {
          cb();
        }
      );
    },
  };

  function setupCounter(initialValue = 0) {
    document.getElementById('counter').innerHTML = initialValue;

    document.getElementById('incrementBtn').addEventListener('click', () => {
      updateCounter({
        type: 'INCREMENT',
      });
    });

    document.getElementById('decrementBtn').addEventListener('click', () => {
      updateCounter({
        type: 'DECREMENT',
      });
    });
  }

  function updateCounter({ type }) {
    counterStorage.get((count) => {
      let newCount;

      if (type === 'INCREMENT') {
        newCount = count + 1;
      } else if (type === 'DECREMENT') {
        newCount = count - 1;
      } else {
        newCount = count;
      }

      counterStorage.set(newCount, () => {
        document.getElementById('counter').innerHTML = newCount;

        // Communicate with content script of
        // active tab by sending a message
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          const tab = tabs[0];

          chrome.tabs.sendMessage(
            tab.id,
            {
              type: 'COUNT',
              payload: {
                count: newCount,
              },
            },
            (response) => {
              console.log('Current count value passed to contentScript file');
            }
          );
        });
      });
    });
  }

  function restoreCounter() {
    // Restore count value
    counterStorage.get((count) => {
      if (typeof count === 'undefined') {
        // Set counter value as 0
        counterStorage.set(0, () => {
          setupCounter(0);
        });
      } else {
        setupCounter(count);
      }
    });

    // Add all eventlisteners
    addEventListeners();
  }

  document.addEventListener('DOMContentLoaded', restoreCounter);

  // Communicate with background file by sending a message
  chrome.runtime.sendMessage(
    {
      type: 'GREETINGS',
      payload: {
        message: 'Hello, my name is Pop. I am from Popup.',
      },
    },
    (response) => {
      console.log(response.message);
    }
  );
})();


function addEventListeners() {
  // Reset all settings to default onclick
  document.getElementById('resetSettingsButton').addEventListener('click', () => {
    resetSettings();
  });

  // Enable only essential cookies
  document.getElementById('onlyEssentialRadio').addEventListener('click', () => {
    enableEssentialCookies();
  });

  // Enable custom cookies
  document.getElementById('customRadio').addEventListener('click', () => {
    enableCustomSettings();
  });
}

function resetSettings() {
  document.getElementById('onlyEssentialRadio').checked = true;
  document.getElementById('marketingCookiesCheckbox').checked = false;
  document.getElementById('legalCookiesCheckbox').checked = false;
  document.getElementById('resetCustomButton').checked = false;
  document.getElementsByClassName('checkboxContainer').disabled = true;
  document.getElementById('marketingCookiesCheckbox').disabled = true;
  document.getElementById('legalCookiesCheckbox').disabled = true;
}


function enableCustomSettings() {
  document.getElementsByClassName('checkboxContainer').disabled = false;
  document.getElementById('marketingCookiesCheckbox').disabled = false;
  document.getElementById('legalCookiesCheckbox').disabled = false;
}

function enableEssentialCookies() {
  document.getElementsByClassName('checkboxContainer').disabled = true;
  document.getElementById('marketingCookiesCheckbox').disabled = true;
  document.getElementById('legalCookiesCheckbox').disabled = true;
}