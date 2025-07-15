# Zeitkammerblick (Photo management app)

A full-stack image management app with Google OAuth login, JWT auth, album sharing and Cloudinary-powered uploads.

---
## Quick Start

```
git clone https://github.com/anmol-virk/zeitkammerblick-frontend.git
cd <zeitkammerblick-frontend>
npm install
npm start
```

---

## Technologies
- React JS
- Node JS
- Express
- MongoDB
- Google OAuth
- JWT

---

## Features
**Landing Page**
- List of all Albums created by Owner and shared by Owner with other Users.
- Add, Edit, see Details, Delete or Share albums options.

**Album Details**
- View all the Images added by User.
- Add Images and add tags to the images.
- Filter images by Tags.
- Like, Comment, Delete and View Favorites images Functionality.

**Authentication**
- User SignIn through Google OAuth
- Routes are protected with JWT

---

## API Reference

### ***GET /api/albums***
List of all Albums created by Owner and shared by Owner with other Users.

### ***POST /api/albums***
Create a new Album.

### ***PUT /api/albums/:id***
Updates the name, description of an Album.

### ***POST /api/albums/:albumId/share***
Shares the Album with other User by just mentioning their Email ID.

### ***GET /api/albums/:albumId/images/all***
To view all images in the Album.

### ***POST /api/albums/:albumId/images***
Add an image to a Album with tags.

### ***Get /api/albums/:albumId/images/favorites***
To view all Favorite images in the Album.

### ***POST /api/albums/:albumId/images/:imageId/comments***
To add a Comment on the Image.

---

## Contact

For bugs or feature request, please reach out to anmolthisside@gmail.com