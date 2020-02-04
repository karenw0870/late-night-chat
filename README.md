# Late Night Chatroom

## Overview

A chatroom solution that allows different user level security.  
Dependant on security levels, users can create groups, add members 
to groups and chat within the groups where they are members.

Groups are created and channels within those groups are created.
Channels are where members can chat in real time utilising 
socket technology.  Chat history is displayed to members.

## Technology

* Angular app utilising NodeJS.
* MongoDB for data storage
* User authentication and encryption
* Upload of profile images
* Sockets used for chat communication

## Security Levels

* Super Admin
  - Full site access and functionality
  - Remove users
* Group Admin
  - Create new users
 * Group Assis
  - Add or remove group users to or from channels
  
 User must login with username and password.

## Structure Notes

Separate Server and Front End apps were built.

Data is stored in JSON format in a MongoDB.

