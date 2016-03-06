# Maddox
### Behavior Driven Development (DBB) In A Scenario Testing Framework
Maddox allows you to test all of your functional business requirements and test performance, from end to end without hitting external dependencies.  Perfect for unit testing a service in a Service Oriented Architecture (SOA).

## Why Should You Use Maddox?

## Prerequisites
1. All external dependencies should be wrapped or decorated (See Decorator Design Pattern) within a proxy layer.  See ./spec/testable for an example application.
2. Tests should enter the application, the same place a user would enter.  For most services, this means the Controller Layer.

## Recommendations
1. If at all possible, your proxy layer should utilize a stateless pattern as it is easier to write and debug tests.  See ./spec/testable/proxies for examples.

## How To Use Maddox
The best way to learn is to see it in action.

1. Testing a Service - ./spec/unit/http-req-unit-test
2. Testing a library - https://github.com/corybill/Preconditions/tree/master/spec
3. Testing a library - https://github.com/corybill/Optional/tree/master/spec

### Scenario API
Maddox uses the philosophy of Scenario testing.  All scenarios use the same base api.

| function                                                                    | definition                                                                                                                                                                | 
|-----------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------| 
| mockThisFunction (MockId, FuncName, Object)                                 | Declare the function to be mocked from the given Object.                                                                                                                  | 
| withEntryPoint (Object entryPointObject, String entryPointFunction)         | Defines where Maddox will execute your test.                                                                                                                              | 
| withInputParams (Array inputParamsIn)                                       | Defines the params that will be passed into the entry point. Identical to 'withHttpRequest'.                                                                              | 
| shouldBeCalledWith (String mockName, String funcName, Array params)         | Test that the given mocked function within the given mock was called with the given params.                                                                               | 
| doesReturn (String mockName, String funcName, Any dataToReturn)             | When a given mocked function that exists within the given mock, is called, it will return the given dataToReturn synchronously.                                           | 
| doesReturnWithPromise (String mockName, String funcName, Any dataToReturn)  | When a given mocked function that exists within the given mock, is called, it will return the given dataToReturn using the Promise A+ protocol's resolve function.        | 
| doesReturnWithCallback (String mockName, String funcName, Any dataToReturn) | When a given mocked function that exists within the given mock, is called, it will return the given dataToReturn using the callback paradigm (err, response).             | 
| doesError (String mockName, String funcName, Any dataToReturn)              | When a given mocked function that exists within the given mock, is called, it will error by throwing the given dataToReturn.                                              | 
| doesErrorWithPromise (String mockName, String funcName, Any dataToReturn)   | When a given mocked function that exists within the given mock, is called, it will error by returning dataToReturn using the Promise A+ protocol's reject function.       | 
| doesErrorWithCallback (String mockName, String funcName, Any dataToReturn)  | When a given mocked function that exists within the given mock, is called, it will error by returning the given dataToReturn using the callback paradigm (err, response). | 
| test ()                                                                     | Execute the Scenario Test                                                                                                                                                 | 



### HttpRequestScenario API
The HttpRequestScenario exposes extra utility functions on top of the base Scenario API.

| function                                             | definition                                                                                                                                     | 
|------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------| 
| withHttpRequest(Array inputParamsIn)                 | Defines the params that will be passed into the entry point. Identical to 'withInputParams'.                                                   | 
| resShouldBeCalledWith(String funcName, Array params) | Test that the given mocked function within a mocked HTTP Response Object was called with the given params.                                     | 
| resDoesReturn(String funcName, Any dataToReturn)     | When a given mocked function that exists within a mocked HTTP Response Object, is called, it will return the given dataToReturn synchronously. | 
| resDoesError(String funcName, Any dataToReturn)      | When a given mocked function that exists within a mocked HTTP Response Object, is called, it will error by throwing the given dataToReturn.    | 
