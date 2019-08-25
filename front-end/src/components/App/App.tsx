import React from 'react';
import '../../App.css';
import {BarnRegistrationCenter} from "../BarnRegistrationCenter/BarnRegistrationCenter";

const App: React.FC = () => {
  return (
      <div className="app">
        <div className="barn-registration-center-container">
          <BarnRegistrationCenter/>
        </div>
      </div>
  );
};

export default App;
