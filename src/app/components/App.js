import React from "react";
import { BrowserRouter as Router, Route, Link, Switch } from "react-router-dom";

import LabelDemo from './LabelDemo';
import VideoDemo from './VideoDemo';

const Index = () => <h2>Click the link to go to each demo</h2>;

const App = () => (
  <Router>
    <div>
      <nav>
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/video-split-demo">Go to video split demo</Link>
          </li>
          <li>
            <Link to="/label-demo">Go to label demo</Link>
          </li>
        </ul>
      </nav>

      <Switch>
        <Route path="/" exact component={Index}/>
        <Route path="/video-split-demo" component={VideoDemo}/>
        <Route path="/label-demo" component={LabelDemo}/>
      </Switch>
    </div>
  </Router>
);

export default App;
