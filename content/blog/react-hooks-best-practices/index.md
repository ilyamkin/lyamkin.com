---
title: Adventuring Into React Hooks Performance Practices
date: "2019-11-07T00:00:00.000Z"
---

From version 16.8.0, React introduced us to a way to use state and other React features without writing a class — [React Hooks](kcd-scripts validate).

It’s an amazing improvement around [the classic Class paradigm](https://reactjs.org/docs/react-component.html) which allows us to reuse stateful logic between components. No surprise that it comes with a learning curve that could lead to performance pitfalls.

Let’s deep dive into the most popular ones and try to figure out how to avoid them.

## Re-Renders Matter
Alright, we identified that we may encounter some performance issues while using Hooks, but where are they coming from?

Essentially, most of the issues with Hooks come from unnecessary renders of your components. Have a look at the following example:

https://codesandbox.io/s/incrementor-46w3y?fontsize=14&hidenavigation=1&theme=dark

This is a component that has two states, A and B, and four increment actions on them. I’ve added the `console.log` method to see the message on every render. The first two actions are basic increments and just increase A or B values by one.

Let’s click on the *a++*, *b++* button and have a look at the console: on each click, there should be only one render. This is really good because that’s what we wanted.

Now press the *a++, b++ after 1s* button: on each click, you’d see two renders. If you’re wondering what’s happening underneath — the answer is simple.
React batches synchronous state updates into one.

On the other hand, for asynchronous functions, each `setState` function triggers a render method.

But what if you want to have consistent behavior? Here comes the first rule of Hooks.

## Rule 1: Do Not Split State Between Several useState Methods for Connected Data Models

Imagine you have two independent states. Then, the requirements changed, thus update of one state causes an update of another one.
In this case, you have to join them in one object: `const { A, B } = useState({ A: 0, B: 0})`. Or, take advantage of the [`useReducer`](https://reactjs.org/docs/hooks-reference.html#usereducer) function.

Another good example of this rule is data loading. Usually, you need three variables to handle it: `isLoading`, `data`, and `error`. Don’t try to keep them separate, prefer `useReducer` instead.

It allows you to separate state logic from components and helps you to avoid bugs. Having one object with these three properties will be a solution as well but would not be that explicit and error-prone.

Trust me on that, I have seen so many people forgetting to set `isLoading: false` on error.

## Custom Hooks
Now that we’ve figured out how to manage `useState` in a single component, let’s move increment functionality outside to be used in different places.

```jsx
const useIncrement = (defaultValue = 0) => {
  const [value, setValue] = useState(defaultValue)
  const increment = () => setValue(value => value + 1)
  return [value, increment]
}

const ExampleWithCustomHook = () => {
  const [a, incrementA] = useIncrement()

  useEffect(() => {
    incrementA()
  }, [incrementA])

  console.log('Re-rendered')
  
  return <h1>{a}</h1>
}
```

We refactored the increment logic to its own Hook and then we run it once using the [`useEffect`](https://reactjs.org/docs/hooks-reference.html#useeffect) function.

Note that we have to provide the `incrementA` setter in the dependency array because we’re using it inside and it’s enforced by [Hook’s ESLint rules](https://www.npmjs.com/package/eslint-plugin-react-hooks). (Please enable them if you didn’t do that before!).

If you try to render this component, your page will be frozen because of infinite re-renders. To fix it, we need to define the second rule of Hooks.

## Rule 2. Make Sure You Return New Objects From Custom Hooks Only If They’ve Changed

The component above is always re-rendering because the increment Hook returns a new function every time. To avoid creating a new function every time, wrap it in the [`useCallback`](https://reactjs.org/docs/hooks-reference.html#usecallback) function.

```jsx
const useIncrement = (defaultValue = 0) => {
  const [value, setValue] = useState(defaultValue);

  const increment = useCallback(() => setValue(value => value + 1), []);

  return [value, increment];
};

const ExampleWithCustomHook = () => {
  const [a, incrementA] = useIncrement();

  useEffect(() => {
    incrementA();
  }, [incrementA]);

  console.log("Re-rendered");

  return <h1>{a}</h1>;
};
```

Now it’s safe to use this Hook.

Sometimes, you need to return a plain object from custom Hooks, make sure you update it only when its content changes using [`useMemo`](https://reactjs.org/docs/hooks-reference.html#usememo).

## How to Find These Re-Renders Before It’s Too Late?

Normally, it’s troublesome to find these issues before it causes performance issues, so you have to use specific tools to detect them beforehand.

One of them is the [`why-did-you-render`](https://github.com/welldone-software/why-did-you-render) library that tells you about avoidable re-renders. Mark your component as `MyComponent.whyDidYouRender = true`, start interacting with it, and look for messages in the console.

I guarantee that you’ll discover something new in the next five minutes.

Another option is to use the Profiler tab in [React Dev Tools extension](https://github.com/facebook/react/tree/master/packages/react-devtools). Although you have to think about how many re-renders you expect from your component— this tab only shows the number of re-renders.

Let me know what other challenges you’ve encountered with Hooks, let’s solve them together.

## References and Further Resources

- [React Hooks API](https://reactjs.org/docs/hooks-reference.html).
- [How to profile React apps with Dev Tools Profiler](https://kentcdodds.com/blog/profile-a-react-app-for-performance/).
