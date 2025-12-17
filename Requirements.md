List of things that should be implemented in the backend:

Database:
o Relational database
o Realistic test data (large enough data set)
o Scalability – using indexes to speed up crucial queries
o Security: Definition of user accounts and privileges for the app and for admins

➢ Backend:
o CRUD operations, error handling
o GraphQL
o logging (for example sentry.io)
o Testing – unit tests, integration tests
o Security: SQL Injection protection, CORS – Cross-Origin Resource Sharing, HTTPS instead of 
HTTP, Authentication - JWT (HTTP-only cookies) or Session, Login and Registration APIs, 
password hashing
o API documentation (OpenAPI Specification – Swagger, ReDoc)

➢ Frontend:
o Proper architecture using components
o SPA – Single-Page Application
o Caching (cache time, stale time, initial data), request retries (for example using React Query)
o Error handling
o Routing – home page, error page, other pages, protected routes where needed
o Logging service (for example sentry.io)
o State management (props, context, global state) – proper solution
o CSS Styles – using components, styled components, CSS files, etc.
o Testing – unit tests
o Security measures against attacks: XSS – Cross-Site Scripting, CSRF – Cross-Site Request 
Forgery, Session hijacking; Login and Registration
o Responsive design - Mobile-first approach


Topics for the exam questions:
Anything we covered during the semester, for example:
➢ SPA - Single Page Applications – for example, how it is done in React.
➢ How to build reusable components for the frontend + advantages of this approach?
➢ Communication between frontend and backend
➢ Client-side vs Server-side rendering
➢ JavaScript:
o Scope of variables: var, let, const, nothing:
➢ TypeScript vs JavaScript
➢ Logging (I was showing logging using Sentry.io). What do we want to log and why?
➢ Routing, protected routes
➢ Pagination, filtering, sorting – which part of the application is responsible for this? 
Backend or frontend? Why?
➢ Forms + input validation
➢ Sharing data between frontend components – global state vs props. Advantages and 
disadvantages of both approaches.
➢ Caching strategies: We used ReactQuery. Cache parameters – explain stale time vs 
cache time.
➢ How to implement http request retries? What is it good for? I showed a solution using 
ReactQuery.
➢ Security (frontend, backend, database):
o Authentication: JWT - stateless, sessions - stateful, cookies
o Authorization: role-based (access to different APIs)
o Understanding hashing and encryption and some use cases (like hashing 
password, https – encrypted http)
o SQL injections
o XSS, CSRF
o CORS
2
➢ CSS (this was not the focus of the course, so I will not be asking too much about it): 
o Different approaches for using CSS:
▪ Writing your own raw CSS – for example when creating the frontend 
based on the existing design (photoshop file, figma, …)
▪ SASS, LASS
▪ CSS libraries like bootstrap, tailwind
▪ Styled components
▪ Component libraries (like Chakra UI that we used for our demo)
o Questions about CSS:
▪ Responsive web design (mobile-first design)
➢ APIs: options + comparison, use cases?
o REST API
o GraphQL
o Message queues (this was extra, so I should not ask about it)
o Web socket
➢ Object-relational mapping vs sending raw queries to the database using a native driver.
Advantages / disadvantages