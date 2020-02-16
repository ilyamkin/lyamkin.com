---
title: Implementing the Prefetch Pattern in React Concurrent Mode
date: "2019-11-04T00:00:00.000Z"
description: What is React Concurrent Mode and how it can help building responsive webapps
---

Recently, React announced a feature of the React ecosystem — [Concurrent Mode](https://reactjs.org/docs/concurrent-mode-intro.html). This would allow us to stop or delay the execution of components for the time that we need. It’ll help React apps stay responsive and gracefully adjust to the user’s device capabilities and network speed.

Concurrent Mode consists of a set of new features — one of the biggest ones is suspense and a new approach to data fetching.

Basically, there are three ways to do it:
- **Fetch-on-render:** We start rendering components and each of these components may trigger data fetching in their effects and lifecycle methods. A good example of that is `fetch` in `useEffect`.
- **Fetch-then-render:** Start fetching all the data for the next screen as early as possible. When the data is ready, render the new screen. We can’t do anything until the data arrives. The example of that is having a `Container` component that handles data fetching and conditionally renders the child presentational component once we’ve received everything.
- **Render-as-you-fetch:** Start fetching all the required data for the next screen as early as possible, and start rendering the new screen immediately, even before we get a network response. As data streams in, React retries rendering components that still need data until they’re all ready.

I believe that the concepts of the first two approaches are well known and definitely presented in your code. Let’s dive straight into the render-as-you-fetch approach.

# Render-As-You-Fetch
You’ve probably noticed that the explanation of this approach has two parts:
- Start loading data as early as possible.
- Start trying to render components that may still need data.

### Fetch early
Let’s build an app together that loads major stock indexes. For that, we have a simple “Load” button. Once you click on it, we start loading data immediately:

```jsx
const App = () => {
  const [prefetchedIndexes, setPrefetchedIndexes] = useState();

  return (
    <>
      <button
        onClick={() => {
            setPrefetchedIndexes(prefetchQuery(`${API}/majors-indexes`));
        }}
      >
        Load all indexes
      </button>
      {prefetchedIndexes && (
          <IndexList prefetchedIndexes={prefetchedIndexes} />
      )}
    </>
  );
};
```

`prefetchQuery` is a function that performs the `fetch` request and returns an object that we’re going to pass to the `<IndexList />` component. The key takeaway from this example is that we’re triggering fetch from the `onClick` event and not in the render phase.

## Render early with Suspense
The second part of the example above is that we’re saving the object from `prefetchQuery` to the state and starting to render `<IndexList />` immediately as well.

On the other hand, we also don’t want to render the list with empty data, so ideally, we’d like to be able to suspend render until we have all the data without writing `if (isLoading) return null`. Luckily, we have [the `Suspense` component](https://reactjs.org/docs/concurrent-mode-suspense.html) for exactly that purpose.

Suspense is a mechanism for data-fetching libraries to communicate to React that *the data a component is reading is not ready yet*. React can then wait for it to be ready and update the UI.

Let me show you an example:

```jsx
const IndexList = ({ prefetchedIndexes }) => {
  const data = usePrefetchedQuery(prefetchedIndexes);

  return data.majorIndexesList.map(index => (
    <div key={index.ticker}>
      Show {index.ticker}
    </div>
  ));
};

const App = () => {
  const [prefetchedIndexes, setPrefetchedIndexes] = useState();

  return (
    <>
      <button
        onClick={() => {
            setPrefetchedIndexes(prefetchQuery(`${API}/majors-indexes`));
        }}
      >
        Load all indexes
      </button>
      {prefetchedIndexes && (
        <Suspense fallback={<span>Loading indexes list...</span>}>
          <IndexList prefetchedIndexes={prefetchedIndexes} />
        </Suspense>
      )}
    </>
  );
};
```

To take advantage of Suspense, you just need to wrap your component with it. It accepts a `fallback` prop: the element that you want to show while waiting for data.

### How To Fetch Data in Sync With Suspense?
Now that you know about Suspense and prefetch practices, you wonder how this all works together. So, here is the last piece of this puzzle. To solve it, let’s finally check out the `prefetchQuery` function.

```jsx
function wrapPromise(promise) {
  let status = "pending";
  let result;
  let suspender = promise.then(
    r => {
      status = "success";
      result = r;
    },
    e => {
      status = "error";
      result = e;
    }
  );
  return {
    read() {
      if (status === "pending") {
        throw suspender;
      } else if (status === "error") {
        throw result;
      } else if (status === "success") {
        return result;
      }
    }
  };
}

// Function that reads resource object
// It could also include Cache logic
export const usePrefetchedQuery = prefetchedQuery => prefetchedQuery.read();

export const prefetchQuery = (input, init) => {
  // Make fetch request
  const promise = fetch(input, init).then(response => response.json());

  // Return resource for Suspense
  return wrapPromise(promise);
};
```

Don’t be scared by the complexity of it, it’s actually fairly simple.
First, we take a URL and pass it to the native `fetch` function, receive a promise, and pass it to the `wrapPromise` function. This function returns an object with the `read()` method:
- If a promise is still pending, we throw this promise.
- If a promise is resolved with error, we throw the error.
- If a promise is resolved, just return the data.

In fact, the only difference we have, compared to traditional fetching practices, is throwing a pending promise.

When you have `usePrefetchedQuery` in `IndexList`, it just executes the `read()` method. If data is not there yet, it throws a promise before actually rendering anything and Suspense will catch that.

# How To Experiment With This?
The React team introduced [an experimental releases](https://reactjs.org/docs/concurrent-mode-adoption.html) branch with a modern API.
For that, you need to run `npm i react@experimental react-dom@experimental` and play with it locally. I also created a live example on [CodeSandbox](https://codesandbox.io/s/prefetch-suspense-6q4gj) for you that shows everything I did together in one working project.

https://codesandbox.io/s/prefetch-suspense-6q4gj

# Can I Use It in My Production Projects?
**No.** Concurrent mode is still under development and some implementation details could change. Use experimental versions to get familiar with new concepts and maybe propose your own ideas. For example, how to integrate prefetch practices in routers or provide a good way to cache data.

# Further Resources
- [An experimental version of Relay with Suspense.](https://relay.dev/docs/en/experimental/a-guided-tour-of-relay)
- Soon, you’ll be able to connect preload functionality to routers. Have a look at [https://github.com/ReactTraining/react-router/pull/7010](https://github.com/ReactTraining/react-router/pull/7010) or [Navi router](https://github.com/frontarm/navi).
- [Introduction to Concurrent mode.](https://reactjs.org/docs/concurrent-mode-intro.html)
- [Introduction to Suspense for data fetching.](https://reactjs.org/docs/concurrent-mode-suspense.html)
- [Live sandbox with examples.](https://codesandbox.io/s/prefetch-suspense-6q4gj)