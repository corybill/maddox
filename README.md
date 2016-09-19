# Maddox
## BETA VERSION - All contracts can still change.

### Behavior Driven Development (DBB) In A Scenario Testing Framework
Maddox allows you to test all of your functional business requirements and test performance, from end to end without hitting external dependencies.  Perfect for unit testing a service in a Service Oriented Architecture (SOA).

[![Build Status](https://travis-ci.org/corybill/maddox.svg?branch=master)](https://travis-ci.org/corybill/maddox)
[![Dependency Status](https://david-dm.org/corybill/maddox.svg)](https://david-dm.org/corybill/maddox)
[![Join the chat at https://gitter.im/corybill/maddox](https://badges.gitter.im/corybill/maddox.svg)](https://gitter.im/corybill/maddox?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![view on npm](http://img.shields.io/npm/v/maddox.svg)](https://www.npmjs.org/package/maddox)
[![npm module downloads](http://img.shields.io/npm/dt/maddox.svg)](https://www.npmjs.org/package/maddox)

## Why Should You Use Maddox?
Article / Blog to come.

## Best Practices
1. All external dependencies should be wrapped or decorated (See Decorator Design Pattern) within a proxy layer.  See ./spec/testable for an example application.
2. Tests should enter the application, the same place a user would enter.  For most services, this means the Controller Layer.
3. All Scenario's are executed asynchronously.  This means that every 'it' block will need to utilize the 'done' function to indicate the test is complete.

## Recommendations
1. If at all possible, your proxy layer should utilize a stateless pattern as it is easier to write and debug tests.  See ./spec/testable/proxies for examples.

## How To Use Maddox
The best way to learn is to see it in action.

1. Testing a Service - ./spec/unit/http-req-unit-test
2. Testing a library - https://github.com/corybill/Preconditions/tree/master/spec
3. Testing a library - https://github.com/corybill/Optional/tree/master/spec

### Scenario API
Maddox uses the philosophy of Scenario testing.  All scenarios use the same base api.

| function                                                                          | definition                                                                                                                                                                                               |
|-----------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| mockThisFunction (String mockName, String funcName, Object object)                | Declare the function to be mocked from the given Object.                                                                                                                                                 |
| withEntryPoint (Object entryPointObject, String entryPointFunction)               | Defines where Maddox will execute your test.                                                                                                                                                             |
| withInputParams (Array inputParamsIn)                                             | Defines the params that will be passed into the entry point. Identical to 'withHttpRequest'.                                                                                                             |
| shouldBeCalledWith (String mockName, String funcName, Array params)               | Test that the given mocked function within the given mock was called with the given params.                                                                                                              |
| shouldAlwaysBeCalledWith (String mockName, String funcName, Array params)         | Test that the given mocked function is called with the same params every time it is called.                                                                                                              |
| doesReturn (String mockName, String funcName, Any dataToReturn)                   | When a given mocked function that exists within the given mock, is called, it will return the given dataToReturn synchronously.                                                                          |
| doesReturnWithPromise (String mockName, String funcName, Any dataToReturn)        | When a given mocked function that exists within the given mock, is called, it will return the given dataToReturn using the Promise A+ protocol's resolve function.                                       |
| doesReturnWithCallback (String mockName, String funcName, Any dataToReturn)       | When a given mocked function that exists within the given mock, is called, it will return the given dataToReturn using the callback paradigm (err, response).                                            |
| doesAlwaysReturn (String mockName, String funcName, Any dataToReturn)             | When a given mocked function that exists within the given mock, is called, it will return the given dataToReturn synchronously, every time the mock is called.                                           |
| doesAlwaysReturnWithPromise (String mockName, String funcName, Any dataToReturn)  | When a given mocked function that exists within the given mock, is called, it will return the given dataToReturn using the Promise A+ protocol's resolve function, every time the mock is called.        |
| doesAlwaysReturnWithCallback (String mockName, String funcName, Any dataToReturn) | When a given mocked function that exists within the given mock, is called, it will return the given dataToReturn using the callback paradigm (err, response), every time the mock is called.             |
| doesError (String mockName, String funcName, Any dataToReturn)                    | When a given mocked function that exists within the given mock, is called, it will error by throwing the given dataToReturn.                                                                             |
| doesErrorWithPromise (String mockName, String funcName, Any dataToReturn)         | When a given mocked function that exists within the given mock, is called, it will error by returning dataToReturn using the Promise A+ protocol's reject function.                                      |
| doesErrorWithCallback (String mockName, String funcName, Any dataToReturn)        | When a given mocked function that exists within the given mock, is called, it will error by returning the given dataToReturn using the callback paradigm (err, response).                                |
| test ()                                                                           | Execute the Scenario Test                                                                                                                                                                                |



### HttpRequestScenario API
The HttpRequestScenario exposes extra utility functions on top of the base Scenario API.

| function                                                      | definition                                                                                                                                                                                 |
|---------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| withHttpRequest(Array inputParamsIn)                          | Defines the params that will be passed into the entry point. Identical to 'withInputParams'.                                                                                               |
| resShouldBeCalledWith(String funcName, Array params)          | Test that the given mocked function within the provided HTTP Response mock, is called with the given params.                                                                               |
| resDoesReturn (String funcName, Any dataToReturn)             | When a given mocked function that exists within the provided HTTP Response mock, is called, it will return the given dataToReturn synchronously.                                           |
| resDoesReturnWithPromise (String funcName, Any dataToReturn)  | When a given mocked function that exists within the provided HTTP Response mock, is called, it will return the given dataToReturn using the Promise A+ protocol's resolve function.        |
| resDoesReturnWithCallback (String funcName, Any dataToReturn) | When a given mocked function that exists within the provided HTTP Response mock, is called, it will return the given dataToReturn using the callback paradigm (err, response).             |
| resDoesError (String funcName, Any dataToReturn)              | When a given mocked function that exists within the provided HTTP Response mock, is called, it will error by throwing the given dataToReturn.                                              |
| resDoesErrorWithPromise (String funcName, Any dataToReturn)   | When a given mocked function that exists within the provided HTTP Response mock, is called, it will error by returning dataToReturn using the Promise A+ protocol's reject function.       |
| resDoesErrorWithCallback (String funcName, Any dataToReturn)  | When a given mocked function that exists within the provided HTTP Response mock, is called, it will error by returning the given dataToReturn using the callback paradigm (err, response). |
| resDoesReturnSelf (String funcName)                           | Sets the return value from this function equal to the response mock.  Most commonly used to allow expresses 'res.status(200).send(result)'.                                                |

### HttpRequestScenario Example
<pre>
    new Scenario() // Create a new Scenario
      .mockThisFunction("ProxyClass", "getFirstName", ProxyClass) // Mock ProxyClass.getFirstName
      .mockThisFunction("ProxyClass", "getMiddleName", ProxyClass) // Mock ProxyClass.getMiddleName
      .mockThisFunction("ProxyClass", "getLastName", ProxyClass) // Mock ProxyClass.getLastName

      .withEntryPoint(Controller, "read") // Declare Controller.read to be the entry point for the test
      .withHttpRequest(httpRequestParams) // Use the object 'httpRequestParams' as the input into the Controller
      // NOTE: The HTTP Response Object is created by Maddox and passed in automatically.

      .resShouldBeCalledWith("send", expectedResponse) // Test that res.send is called with the same parameters that are defined in 'expectedResponse'
      .resShouldBeCalledWith("status", expectedStatusCode) // Test that res.status is called with the same parameters that are defined in 'expectedStatusCode'
      .resDoesReturnSelf("status") // Allow Express's expected chainable call res.status().send()

      .shouldBeCalledWith("ProxyClass", "getFirstName", getFirstName1Params) // Test that the first call to ProxyClass.getFirstName is called with the same parameters that are defined in 'getFirstName1Params'
      .doesReturnWithPromise("ProxyClass", "getFirstName", getFirstName1Result) // When ProxyClass.getFirstName is called for the first time, return 'getFirstName1Result' using Promise A+ protocol

      .shouldBeCalledWith("ProxyClass", "getFirstName", getFirstName2Params) // Test that the second call to ProxyClass.getFirstName is called with the same parameters that are defined in 'getFirstName2Params'
      .doesReturnWithPromise("ProxyClass", "getFirstName", getFirstName2Result) // When ProxyClass.getFirstName is called for the second time, return 'getFirstName2Result' using Promise A+ protocol

      .shouldBeCalledWith("ProxyClass", "getMiddleName", getMiddleNameParams) // Test that the first call to ProxyClass.getMiddleName is called with the same parameters that are defined in 'getMiddleNameParams'
      .doesReturn("ProxyClass", "getMiddleName", getMiddleNameResult) // When ProxyClass.getMiddleName is called for the first time, return 'getMiddleNameResult' synchronously

      .shouldBeCalledWith("ProxyClass", "getLastName", getLastNameParams) // Test that the first call to ProxyClass.getLastName is called with the same parameters that are defined in 'getLastNameParams'
      .doesReturnWithCallback("ProxyClass", "getLastName", getLastNameResult) // When ProxyClass.getLastName is called for the first time, return 'getLastNameResult' using the callback paradigm. i.e. callback(err, result)

      .test(done); // Executes the test.  Up to this point, we have only build out the test context.  No tests are executed until the test function is called.
      // NOTE: All scenarios are asynchronous. Ensure that that 'done' function is passed in or executed by you.
</pre>
