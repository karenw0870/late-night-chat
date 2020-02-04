# Late Night Chat Assignment

##### Karen Whitlock S5074208
##### Semester 2 2019

## The Project

A chat system to include front end with dashboard using Angular and server backend using node.  It allows users to communicate with each other within different groups and channels within those groups.

### GitHub Repository

https://github.com/karenw0870/assignment3813  (public)

### Security

Security assigned to users in their record are
* SuperAdmin
* GroupAdmin
* General

An additional security for users to be granted Admin assistant privileges is determined within a group and stored in a separate entity.
 
## Division of Responsibilities

The client side components are responsible for handling the display of data.  They are also responsible for building the models with data from the front end that are then passed to services.

The client side services are responsible for making the API calls to the server.  In some cases there are additional services that provide other functions such as building a select list of users.

The server is responsible for retrieving and storing the data that is passed from the client. It also handles additional data verification where necessary to ensure the data is cleansed before being stored.  The data is stored in a JSON file on the server for quick retrieval of the stored data.

Specific security restrictions have been identified and outlined. Some users will have Admin permissions to add groups, users and add users to channels. SuperAdmin class will have full access.

## Data Structures

In both client and server side the Classes or Models were named as singular items as they represented a single object.  Any related data to be used with the object were stored in object arrays with a plural naming convention.  The naming and layout of these structures was kept the same both client and server side to avoid confusion.

### Client Side

Models were created in the Client Side to manage the various entities used to represent data objects.  Individual files were created for each of the entities and a separate 'interfaces' file was used for all select list interfaces.  All these files were stored in the folder '_models'.

Client side models were built to reflect the server side classes and the JSON data file that was used.  Each of the separate models were stored in a separate .ts class file.

#### Models

* User - user entity for storing users
* Group - main group entity
* GroupAssist - group assistant associated with each group
* Channel - entity for subgroups of groups
* Member - members associated with each channel
* Message - stores the messages between members (not used during the initial project)

### Server Side

The JSON data files were stored in the 'data' folder.  All Classes used to represent the data objects were stored in the 'classes' folder.

A JSON data file was used to store the groups and all related data for those groups.  In a separate JSON file the users are stored.  Only id number and codes were stored to reduce the problem of redundant data.  Classes all took parameters of every field required for data entry.  Any related text fields were manually updated after the object was built.

Classes were developed to copy those of the data models client side so that data was correctly handled being passed to the client.  Some properties were text value of related id fields so they could be represented and displayed correctly to the user.
Data sent back to the client was sent back as an array of Class objects.

## Architecture

### Angular Architecture

#### Components

Each entity has a Delete, Edit, Detail and/or Index component.  Each of these components are stored in a folder relevant to the entity.  Entities may or may not have a component for each of these functions.

Users has a complete set of CRUD components so users can be managed easily.  The UserDetailComponent summarises any of the group related records. The GroupDetailComponent handles the group assists functions on the same screen and the ChannelDetailComponent handles the members and messages related to the channel. The DashboardComponent is handled as a separate main page for the system.  It displays all the groups where the user is either a GroupAdmin or where they are members for a channel.
* Dashboard 
  * If SuperAdmin all groups are displayed otherwise only those where the user is an Admin or a Member are displayed
* Login
* User
  * User delete (Only SuperAdmin)
  * User detail (Current user can view their own record)
  * User edit (GroupAdmin)
  * User index (a full list of all users)
* Group
  * Group detail (GroupAdmin if admin of this group, Channel members)
     * Channels are added (GroupAdmin, GroupAssist of this group)
     * GroupAssists added or deleted (GroupAdmin)
  * Group edit (GroupAdmin)
* Channel
  * Channel detail 
      * Add or remove Members (GroupAssist)

#### Services

Services were used to handle the CRUD functions of all components.  The naming conventions were in line with the entity that was being handled.  Some services had additional functions.
* User service
* Group service
* Channel service

The AuthService holds a few additional properties to make accessing the current logged in user credentials easier.
* currUserValue (return a User object)
* currIsSuper (If the current user is a SuperAdmin then returns true)
* currIsGroup (if the current user is a GroupAdmin then returns true)

An additional service 'SelectService' was used to manage selection lists for select lists.  It does not make any direct API calls but instead utilises the other services for API calls.

#### Models
Models for each of the entities were developed and stored in the '_models' folder.  Further details above under `Data Structures`.

#### Routes

Routes are stored in the AppRouting module.  Any 'create' required routes would use the 'edit' routes instead and specify the id as 0.   Routes are detailed under `Client Side Routes`.

### Node Server Architecture

#### Routes

All API routes were stored in the folder 'routes' dependent on the data entity there were handling to be posted back to the client.
* channel.js (also handles some member routes)
* group.js (also handles some group assist routes)
* message.js (unused in this part of the project)
* user.js

The authorisation (auth.js) module handled the authorisation and handling of the return of the logged in user data.
* auth.js

#### Functions

Any files containing functions or modules utilised by the routes are stored in the 'functions' folder.  These include functions for reading and writing data to and from JSON files.
* Filehandler	Read and Write functions for JSON files
* Global 
  * getNextId - Gets the next Id number in a given element
  * findItem - Finds an object for the specified element meeting the criteria

#### Files

JSON data files handled the storage of data and were all stored in the folder 'data'.  The users were in one file and the group data with its associated data for channels, members, group assists, and messages where all stored in the same data file.
* userdata.js
* groupdata.js

#### Classes

All data classes to handle data being sent back to the client are in separate files under 'classes' folder.  This was outlined in further detail under `Data Structures`.

## Server Side Routes

Docment   |   Method   | Route       |   Purpose   |   Request/Param   |   Response
--------- | ---------- | ----------- | ----------- | ----------------- | --------------
auth.js   | Post | /api/auth | Check user validity on login | {username,password} | {valid:true/false}
user.js   | Post | /api/auth/getcurr | Gets the current user record base on password & username | {username:’’, password:’’} | User object
user.js   | Post | /user | Update/create User | User object	
user.js   | Get  | /user/:id | Retrieve the Group and related records for the specified Group | @param: id | User, related Groups & related
user.js   | Delete | 	/user/:id | Delete the specified User | @param: id | True / false
user.js   | Get | 	/user | Full list of all users – no related records included |  | All users as array of objects
group.js  | Post | 	/group | Update/create Group | User object | Updated User object
group.js  | Get | 	/group/:id | Retrieve the Group and related records for the specified Group | @param: id | Group & related Channel objects
group.js  | Delete | 	/group/:id | Delete the specified Group | @param: id | True / false
group.js  | Get | 	/group | List of all groups; dependant on user credentials |  | All groups as array of objects
group.js  | Post | 	/group/groupassist | Update/create GroupAssist objects | GroupAssist object | GroupAssist object
group.js  | Delete | 	/group/groupassist /delete/:id | Delete the specified GroupAssist object | @param: id, groupid | True / false
channel.js| Post | 	/channel | Update/create Channel | User object | Updated User object
channel.js| Get | 	/channel/:id | Retrieve the Channel and related records for the specified Channel | @param: id | Channel & related Member objects
channel.js| Delete | 	/channel/:id | Delete the specified Channel | @param: id | 	True / false
channel.js| Post   | 	/channel /member | Update/create GroupAssist objects | 	GroupAssist object | 	Upated GroupAssist object
channel.js| Delete | 	/channel/member /delete/:id | Delete the specified Member object | 	@param: id | 	True / false

## Version Control

A .git repository on GitHub was utilises to track the changes and allow for the review of code and to provide the ability to revert to a previous version if necessary.

The master branch was utilised for a 'live' working copy that was fully functioning.  If a major change needed to be made a new branch was created, namely 'test' and any changes or additions were made in that copy.  Once changes were made, tested and evaluated they were merged back into the master to leave a full clean working copy again.



## Project Details (auto-generated code)

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.2.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.


