-- @file init.sql
-- @description Initializes the shared SQLite database for TigerTix.
-- Creates Event and Ticket tables with necessary schema and foreign key constraints.

--for toggling on foreign keys, which ticket needs to access
PRAGMA foreign_keys = ON;

--if a table exists then drop it
DROP TABLE IF EXISTS Ticket;
DROP TABLE IF EXISTS EVENT;

-- event table
CREATE TABLE Event (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT NOT NULL,
    event_date TEXT NOT NULL,
    event_tickets INTEGER NOT NULL, --how many tickets are available
    event_location TEXT NOT NULL

);

--ticket id
CREATE TABLE Ticket (
ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,
event_id INTEGER NOT NULL, --the foreign key that accesses the event table
ticket_price REAL,
ticket_type TEXT,
ticket_availability BOOLEAN NOT NULL, -- no idea if we need this but i would assume you would want to know if tickets are available
FOREIGN KEY(event_id) REFERENCES Event(event_id)

);