# McDonald's Order Processing System

## Introduction
This project is a prototype for managing McDonald's automated cooking bots, handling customer orders, VIP prioritization, and bot management. It allows orders to be submitted, processed, and managed by cooking bots in real-time, simulating an automated system for fast food order fulfillment.

## Table of Contents
- [Installation](#installation)
- [Features](#features)
- [Diagrams](#diagrams)
- [Prototypes](#prototypes)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
- [Usage](#usage)
- [Test Cases](#test-cases)

## Installation

### Prerequisites:
- **Node.js** (v16.13.0 or compatible)
- **npm**

### Steps:
1. Clone the repository:
   ```bash
   git clone -b devming https://github.com/tyongming/se-take-home-assignment.git
   
2. Navigate to the backend folder and install dependencies:
    ```bash
    cd backend
    npm install
    
3. Navigate to the frontend folder and install dependencies:
    ```bash
    cd ../frontend
    npm install
    
4. Run the backend server:
    ```bash
    cd backend
    npm run start:dev
    
5. Run the frontend server:
    ```bash
    cd ../frontend
    npm run start
    
The backend server will run on http://localhost:3000 and the frontend on http://localhost:4200.

## Features
- **Add Normal and VIP Orders:** Customers can place both normal and VIP orders, with VIP orders given priority.
- **Manage Cooking Bots:** Add or remove bots to handle pending orders. Bots will pick up and process orders automatically.
- **Real-Time Updates:** Watch as orders move from the Pending area to Completed, with a real-time countdown for each processing order.
- **Order Processing:** Orders are processed one at a time by each bot, with VIP orders being prioritized.
- **Bot Removal Handling:** If a bot is removed while processing an order, the order is returned to the Pending area.

## Architecture
The project is structured into two main parts:

1. **Frontend (Angular):**

- This part is responsible for the user interface, where users can place orders and manage bots.
- The frontend interacts with the backend through HTTP API calls and WebSockets for real-time updates.

2. **Backend (NestJS):**

- This is the core logic of the system, responsible for managing orders, assigning orders to bots, and handling real-time updates via WebSockets.
- The backend uses in-memory storage for orders and bots, as no persistent storage is required for this prototype.

The backend processes orders by assigning them to bots, and the frontend reflects the real-time state of orders and bots through WebSocket communications.

## Diagrams
- [Order Management Flow Chart](docs/diagrams/order_management_flow_chart.png)
- [Bot Addition and Order Processing Flow Chart](docs/diagrams/bot_addition_and_order_processing_flow.png).
- [Bot Removal Flow Chart](docs/diagrams/bot_removal_flow_chart.png)

## Prototypes
You can access the prototypes in Figma by [clicking here](https://www.figma.com/design/U1EL8YzSAPXEZh48yrDmxD/McDonald's-Order-Controller---UI-Design?node-id=0-1&m=dev&t=suQvXnqDXrJDfiMJ-1).

## API Documentation
The backend API is documented with **Swagger**. After starting the backend server, you can view the API documentation by visiting:
    
    http://localhost:3000/mcdonalds-order-api/swagger-doc


## Usage
### Adding Orders:
- **Add Normal or VIP Orders:**
    - Click the "New Normal Order" button to add a normal order.
    - Click the "New VIP Order" button to add a VIP order.
    - Orders will appear in the Pending area and be processed based on priority.
    
### Managing Bots:
- **Add Bots:** Click the "Add Bot" button to add a new bot that will handle orders from the Pending list.
- **Remove Bots:** Click the "Remove Bot" button to remove the most recently added bot. If the bot is currently processing an order, the order will be returned to the Pending list.

### Real-Time Monitoring:
- Orders are processed in real-time, and you can monitor the progress using countdown timers. The system updates in real-time via WebSockets, ensuring that the frontend always displays the current state of the orders and bots.

### Order Completion:

- Once an order is completed, it moves to the Completed area. If all bots are removed, processing halts, and remaining orders stay in Pending.

## Test Cases

You can view the detailed test cases [here](./docs/TEST_CASES.csv).