import React, { useState, useEffect } from 'react';
import {
  AppConfig,
  UserSession,
  showConnect,
} from '@stacks/connect';
import {
  makeContractCall,
  callReadOnlyFunction,
  uintCV,
  stringUtf8CV,
  cvToJSON,
} from '@stacks/transactions';
import { StacksTestnet } from '@stacks/network';
import './App.css';

const appConfig = new AppConfig(['store_write']);
const userSession = new UserSession({ appConfig });
const network = StacksTestnet;

const CONTRACT_ADDRESS = 'ST14GBGN745D9TY68Q99DJEQJNGTV8BP9YX4FCH1N';
const CONTRACT_NAME = 'guestbook';

function App() {
  const [message, setMessage] = useState('');
  const [readId, setReadId] = useState('');
  const [fetchedMessage, setFetchedMessage] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.className = darkMode ? 'dark' : '';
  }, [darkMode]);

  const handleConnect = () => {
    showConnect({
      appDetails: {
        name: 'Guestbook DApp',
        icon: window.location.origin + '/logo192.png',
      },
      onFinish: () => window.location.reload(),
      userSession,
    });
  };

  const handlePostMessage = async () => {
    const txOptions = {
      contractAddress: CONTRACT_ADDRESS,
      contractName: CONTRACT_NAME,
      functionName: 'post-message',
      functionArgs: [stringUtf8CV(message)],
      network,
      appDetails: {
        name: 'Guestbook DApp',
        icon: window.location.origin + '/logo192.png',
      },
      userSession,
      onFinish: () => {
        alert('Message posted successfully!');
        setMessage('');
      },
    };

    await makeContractCall(txOptions);
  };

  const handleReadMessage = async () => {
    try {
      const result = await callReadOnlyFunction({
        contractAddress: CONTRACT_ADDRESS,
        contractName: CONTRACT_NAME,
        functionName: 'get-message',
        functionArgs: [uintCV(Number(readId))],
        network,
        senderAddress: userSession.loadUserData()?.profile?.stxAddress?.testnet,
      });

      const json = cvToJSON(result);
      if (json.value && json.value.message?.value) {
        setFetchedMessage(json.value);
      } else {
        setFetchedMessage(null);
        alert('Message not found.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to fetch message.');
    }
  };

  return (
    <div className="App">
      <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
        {darkMode ? '☀️' : '🌙'}
      </button>

      {!userSession.isUserSignedIn() ? (
        <div className="centered">
          <div>
            <h1>📘 Guestbook DApp</h1>
            <button onClick={handleConnect}>🔗 Connect Wallet</button>
          </div>
        </div>
      ) : (
        <>
          <h1>📘 Guestbook DApp</h1>

          <div className="card">
            <p><strong>✅ Connected</strong></p>
          </div>

          <div className="card">
            <h2>✍️ Post Message</h2>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={280}
              rows={4}
              placeholder="Enter your guestbook message..."
            />
            <button onClick={handlePostMessage} disabled={!message}>Submit</button>
          </div>

          <div className="card">
            <h2>🔍 Read Message by ID</h2>
            <input
              type="number"
              value={readId}
              onChange={(e) => setReadId(e.target.value)}
              placeholder="Enter message ID"
            />
            <button onClick={handleReadMessage} disabled={!readId}>Fetch</button>

            {fetchedMessage && (
              <div className="message">
                <p><strong>📤 Sender:</strong> {fetchedMessage.sender.value}</p>
                <p><strong>💬 Message:</strong> {fetchedMessage.message.value}</p>
                <p><strong>⏰ Timestamp:</strong> {fetchedMessage.timestamp.value}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;
