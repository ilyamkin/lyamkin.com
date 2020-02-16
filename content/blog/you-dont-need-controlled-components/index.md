---
title: You Might Not Need Controlled Components
date: "2019-10-01T00:00:00.000Z"
---

If you'll go to the official React website it says that [the recommended way to use inputs is to control them via React state](https://reactjs.org/docs/uncontrolled-components.html). It also mentions that in some cases you can go with an uncontrolled option but do not say what are these cases explicitly. Let’s try to dive into it and see the pros and cons of this approach.

# It’s all about control

Controlled input values are being kept in the local state. Every time the user changes the content of the input, the `onChange` function updates the React state, Component rerenders with the new value passed to Input.

```jsx
const SimpleControlledForm = () => {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  
  const onSubmit = useCallback((e) => {
    e.preventDefault()
    sendData({ email, name })
  }, [email, name])
  
  return (
    <form onSubmit={onSubmit}>
      <input name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input name="name" value={name} onChange={(e) => setName(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  )
}
```

# Let browser do its job

On the other hand, uncontrolled inputs are being handled by the browser itself. So you don’t have direct control over inputs value in the component, but you can use ref to get access to it.

```jsx
const SimpleUncontrolledForm = () => {
  const onSubmit = useCallback(e => {
    e.preventDefault()
    const { email, name } = e.target
    sendData({ email: email.value, name: name.value })
    e.target.reset()
  }, [])

  return (
    <form onSubmit={onSubmit}>
      <input name="email" />
      <input name="name" />
      <button type="submit">Submit</button>
    </form>
  )
}
```

Looking at these two examples you can clearly say that the second one looks cleaner and less verbose than the first one. You don’t need to instantiate state, pass the value to each input and override `onChange` handlers.

An uncontrolled form doesn’t have state, so every time you type, your component doesn’t re-render, increasing overall performance.

By leveraging uncontrolled inputs you’re trusting browser with form management and become closer to the native implementation. Why do you need to write something that was already created anyway? 🤔

## But what if I need to handle complex form, perform validation or handle custom submit logic?

Use refs. With new Hooks API, refs became a more stable and better way to control DOM. Consider the following example where you need to access forms values outside of the `onSubmit` function.

```jsx
const SimpleUncontrolledForm = () => {
  const form = useRef()
  const onSubmit = useCallback(
    e => {
      e.preventDefault()
      const { email, name } = e.target
      sendData({ email: email.value, name: name.value })
      e.target.reset()
    }, []
  )
  
  const sendValues = () => {
    const { email, name } = form.current
    sendData({ email: email.value, name: name.value })
  }

  return (
    <>
      <form ref={form} onSubmit={onSubmit}>
        <input name="email" />
        <input name="name" />
        <button type="submit">Submit</button>
      </form>
      <button onClick={sendValues}>Send values</button>
    </>
  )
}
```

## Embrace HTML5

Browser API provides you with a lot of useful features to handle forms and inputs.
- [`form.reset()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reset) — use the reset function to clear all your fields
- [`form.submit()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit) — use it to programmatically submit the form
- [`form.reportValidity()`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/reportValidity) — checks validation constraints and returns `true` or `false`
- [`document.forms`](https://developer.mozilla.org/en-US/docs/Web/API/Document/forms) — interface that allows you to access all forms on the page.
- [Constraint Validation API](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation) — set of properties and methods that allows you to create complex validations on the fields. `min`, `max`, `pattern`, `email`, `required` — all of that and much more is covered by it.

## What about libraries that I can use with uncontrolled inputs?

Sure! [React-Hook-Form](https://github.com/react-hook-form/react-hook-form) allows you to build a form and perform validation on it without the hassle. [Unform](https://github.com/Rocketseat/unform) helps you build complex forms with nested fields, validation using uncontrolled components.

## When it makes sense to use controlled inputs then?

Basically you need to choose controlled inputs when _you need to re-render_ your component on every type. For example, you want to display or send all form values as you type (imagine autocomplete field for the search bar). Or if you need to pass input value to child component through props. There are quite a few cases where you have to use it.

# Conclusion

I believe that uncontrolled components are currently undervalued and should have more presence in modern React applications. Indeed they’re not gonna solve all your problems but would help increase the performance and reliability of your components in many cases.