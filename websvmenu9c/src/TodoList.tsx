import React, { FC } from 'react';
import './App.css';

const TodoList: FC = () => {
  return (
    <div className="App-header">
      {/* Your activity's UI and logic */}
      <h2>Todo List Activity 01</h2>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
    </div>
  );
};

export default TodoList;