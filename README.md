# gma-video-backend

The project is maded with React in frontend, and Node.js, MongoDB in backend.

It's a simple video streaming platform that allow user to watch videos and communicate with different people. You can watch different videos on gma-video, leave a comment to support author or even share your ideas as a channel.

**Frontend repository：https://github.com/gma201011/gma-video-frontend**

***

### Demo

Demo Link：https://gmademo.com/

Test account：admin@gmail.com

password：admin

***

### Tools

* express
* mongoose(for mongoDB)
* ioredis(for redis)
* jsonwebtoken
* @alicloud/pop-core（aliyun vod SDK）

***

### API Documentation

https://hackmd.io/@ulnNJQ5cR-CXl97p1i5cdA/H1z1Tfqhq

***

### Data Base Structure

![image](https://github.com/gma201011/picture/blob/main/db%20structure.png)

https://dbdiagram.io/d/62dc945e0d66c7465538d9e4

### File Structure

```
App.js
│
├─config
│  └── config.default.js
│  
│
├─controller
│  ├── index.js
│  ├── userController.js
│  ├── videoController.js
│  └── vodController.js 
│
│
├─middleware
│  ├── validator
│        errorBack.js
│        userValidator.js
│        videoValidator.js
│
│
├─model
│  ├── redis
│        baseModel.js
│        collectModel.js
│        index.js
│        subscribeModel.js
│        userModel.js
│        videocommentModel.js
│        videolikeModel.js
│        videoModel.js
│
│
├─router
│  ├── index.js
│  ├── user.js
│  └── video.js
│
│
├─util
│  ├── jwt.js
│  └── md5.js
```
