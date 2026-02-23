import React, { useEffect, useState } from 'react';

const Counter = ({ end, duration, icon }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 1000 / 60);

    const counter = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(counter);
      } else {
        setCount(Math.floor(start));
      }
    }, 60);

    return () => clearInterval(counter);
  }, [end, duration]);

  return (
    <div className="counter-container">
      <span>{icon}</span>
      <h3>{count}</h3>
    </div>
  );
};

export default Counter;
