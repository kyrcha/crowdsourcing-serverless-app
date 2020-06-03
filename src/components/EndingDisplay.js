import React from "react";
import { Link } from "react-router-dom";
import Header from "./Header.js";

import "../styles/EndingDisplay.css";

function EndingDisplay() {
  return (
    <div>
      <Header text="Understanding web visual preferences" logoDisplay={true} />

      <div className="outro">
        <h4>Thank you for participating in our research.</h4>
        <p>
          We appreciate your help! For bug reports or any other information, you
          may contact us at at alex.delitzas@gmail.com or kyrcha@gmail.com.
        </p>
        <h4>If you want to repeat the test, click the button below.</h4>

        <br />
        <div className="button-to-start">
          <Link to="/voting">
            <button type="button">
              <span>{"Start again!"}</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EndingDisplay;
