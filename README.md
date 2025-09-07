<h1 style="font-sizer: large">ChatApplication</h1>
<div style="text-align: center; margin-bottom: 20px;"> <h1>Real-Time Chat Application</h1> <p>A full-stack messaging app built with <strong>Django</strong> backend, <strong>React</strong> frontend, and <strong>Redis</strong> for real-time features. Includes secure login and signup functionality.</p> </div>
Features
<ul> <li><strong>User Authentication</strong>: Secure login and signup with token-based auth using Django REST Framework.</li> <li><strong>Real-Time Messaging</strong>: Instant chat via WebSockets (Django Channels) and Redis for message brokering.</li> <li><strong>User Management</strong>: Online user lists, chat rooms, and real-time message handling.</li> <li><strong>Frontend UI</strong>: Responsive React interface for chats, user lists, and auth forms.</li> <li><strong>Backend API</strong>: RESTful endpoints for users, messages, and updates.</li> </ul>
Tech Stack
<table> <thead> <tr> <th>Component</th> <th>Technology</th> </tr> </thead> <tbody> <tr> <td>Backend</td> <td>Django (with REST Framework and Channels)</td> </tr> <tr> <td>Frontend</td> <td>React (with hooks and API integration)</td> </tr> <tr> <td>Database</td> <td>PostgreSQL/SQLite (configurable); Redis for caching/real-time</td> </tr> <tr> <td>Other</td> <td>Git, Docker (optional)</td> </tr> </tbody> </table>
Prerequisites
<ul> <li>Python 3.x</li> <li>Node.js and npm</li> <li>Redis server</li> <li>Git</li> </ul>
Installation
Backend (Django)
Clone the repository:

text
git clone https://github.com/ANURODHOP/Chat-Application.git
cd chatapplication/backend
Set up virtual environment:

text
python -m venv venv
source venv/bin/activate  <!-- On Windows: venv\Scripts\activate -->
Install dependencies:

text
pip install -r requirements.txt
Configure <code>.env</code> file:

text
SECRET_KEY=your_django_secret_key
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
REDIS_URL=redis://localhost:6379/0
Run migrations and server:

text
python manage.py migrate
python manage.py runserver
<div style="background-color: #f0f0f0; padding: 10px; border-radius: 5px;"> <p><em>For production/WebSockets, use Daphne or Uvicorn.</em></p> </div>
(Optional) Start Celery:

text
celery -A chatapplication worker -l info
Frontend (React)
Navigate to frontend:

text
cd ../frontend
Install dependencies:

text
npm install
Start dev server:

text
npm start
<p>Runs on <a href="http://localhost:3000">http://localhost:3000</a> with API proxy to backend.</p>
Usage
Signup/Login: Create account or log in via the app.

Chat: Select users, send/receive messages in real-time.

Testing: Use Postman for APIs (e.g., <code>/api/login/</code>).

Ensure Redis is running for real-time features.

<div style="border: 1px solid #ccc; padding: 10px; margin-top: 20px;"> <h3>Contributing</h3> <p>Fork the repo, create a branch, commit changes, and submit a pull request. Follow Django/React conventions.</p> </div>
