"use client";

export default function Error({ reset }: { reset: () => void }) {
  return (
    <div>
      <h1>Something went wrong</h1>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
