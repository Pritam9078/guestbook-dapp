import React, { useEffect, useState } from 'react';
import { UserSession, AppConfig, showConnect } from '@stacks/connect';
import { StacksTestnet } from '@stacks/network'; // <-- Use this class, it's still valid in recent versions
import { openSignatureRequestPopup } from '@stacks/connect';

const appConfig = new AppConfig(['store_write']);
const userSession = new UserSession({ appConfig });

const ConnectWallet: React.FC = () => {
  const [userData, setUserData] = useState<any>(null);

  const connectWallet = () => {
    showConnect({
      appDetails: {
        name: 'Guestbook DApp',
        icon: window.location.origin + '/logo192.png',
      },
      onFinish: () => {
        setUserData(userSession.loadUserData());
      },
      userSession,
    });
  };

  useEffect(() => {
    if (userSession.isUserSignedIn()) {
      setUserData(userSession.loadUserData());
    }
  }, []);

  return (
    <div>
      {userData ? (
        <p>Connected as: {userData.profile.stxAddress.testnet}</p>
      ) : (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
    </div>
  );
};

export default ConnectWallet;
