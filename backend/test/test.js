const chai = require("chai");
const chaiHttp = require("chai-http");
chai.use(chaiHttp);
const { expect } = chai;
const mongoose = require("mongoose");
const app = require("../server");
const sinon = require("sinon");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Album = require("../models/Album");
const Review = require("../models/Review");

const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");
const adminController = require("../controllers/adminController");
const admin = require("../middleware/adminMiddleware");

afterEach(() => {
  sinon.restore();
});

describe("Login Function Test", () => {
  it("should login successfully with correct credentials", async () => {
    const mockUserId = new mongoose.Types.ObjectId();

    const req = {
      body: { email: "testuser@example.com", password: "correctpassword" },
    };

    sinon.stub(User, "findOne").resolves({
      nickname: "testuser",
      email: "testuser@example.com",
      password: "hashedpassword",
    });
    sinon.stub(bcrypt, "compare").resolves(true);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await authController.loginUser(req, res);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0].data).to.include({
      nickname: "testuser",
      email: "testuser@example.com",
    });
  });

  it("should return 400 if required fields are missing", async () => {
    const req = {
      body: {
        email: "", // missing email
        password: "123456",
      },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await authController.loginUser(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ description: "Missing required fields" }))
      .to.be.true;
  });

  it("should return 402 for invalid email format", async () => {
    const req = {
      body: {
        nickname: "newuser",
        email: "invalid-email",
        password: "123456",
        confirmPassword: "123456",
        type: "user",
      },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await authController.registerUser(req, res);

    expect(res.status.calledWith(402)).to.be.true;
    expect(res.json.calledWithMatch({ description: "Invalid email format" })).to
      .be.true;
  });

  it("should return 407 for incorrect username or password", async () => {
    const mockUserId = new mongoose.Types.ObjectId();

    const req = {
      body: { email: "testuser@example.com", password: "wrongpassword" },
    };

    sinon.stub(User, "findOne").resolves({
      _id: mockUserId,
      nickname: "testuser",
      email: "testuser@example.com",
      password: "hashedpassword",
    });
    sinon.stub(bcrypt, "compare").resolves(false);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await authController.loginUser(req, res);

    expect(res.status.calledWith(407)).to.be.true;
    expect(
      res.json.calledWithMatch({ description: "Invalid email or password" }),
    ).to.be.true;
  });

  it("should return 407 when email does not exist", async () => {
    const req = {
      body: { email: "notfound@example.com", password: "any" },
    };

    sinon.stub(User, "findOne").resolves(null);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
    await authController.loginUser(req, res);

    expect(res.status.calledWith(407)).to.be.true;
    expect(
      res.json.calledWithMatch({ description: "Invalid email or password" }),
    ).to.be.true;
  });

  it("should return 409 when login is called with a valid token", (done) => {
    const secret = process.env.JWT_SECRET || "defaultsecret";
    const validToken = jwt.sign({ id: "1234567890" }, secret);

    chai
      .request(app)
      .post("/api/auth/login")
      .set("Authorization", `Bearer ${validToken}`)
      .send({
        email: "test@example.com",
        password: "123456",
      })
      .end((err, res) => {
        expect(res).to.have.status(409);
        done();
      });
  });

  it("should NOT return 409 when login is called with an invalid token", (done) => {
    sinon.stub(User, "findOne").resolves(null);

    chai
      .request(app)
      .post("/api/auth/login")
      .set("Authorization", "Bearer faketoken123")
      .send({
        email: "test@example.com",
        password: "123456",
      })
      .end((err, res) => {
        expect(res).to.not.have.status(409);
        done();
      });
  });
});

describe("Register Function Test", () => {
  it("should register a new account successfully", async () => {
    const mockNewUserId = new mongoose.Types.ObjectId();

    const req = {
      body: {
        nickname: "newuser",
        email: "newuser@example.com",
        password: "123456",
        confirmPassword: "123456",
        type: "user",
      },
    };

    sinon.stub(User, "findOne").resolves(null);
    sinon.stub(User, "create").resolves({
      nickname: "newuser",
      email: "newuser@example.com",
      type: "user",
    });

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await authController.registerUser(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0].data).to.include({
      nickname: "newuser",
      email: "newuser@example.com",
      type: "user",
    });
  });

  it("should return 400 if required fields are missing", async () => {
    const req = {
      body: {
        nickname: "newuser",
        email: "", // missing email
        password: "123456",
        confirmPassword: "123456",
        type: "user",
      },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await authController.registerUser(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(res.json.calledWithMatch({ description: "Missing required fields" }))
      .to.be.true;
  });

  it("should return 402 for invalid email format", async () => {
    const req = {
      body: {
        nickname: "newuser",
        email: "invalid-email",
        password: "123456",
        confirmPassword: "123456",
        type: "user",
      },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await authController.registerUser(req, res);

    expect(res.status.calledWith(402)).to.be.true;
    expect(res.json.calledWithMatch({ description: "Invalid email format" })).to
      .be.true;
  });

  it("should return 405 if passwords mismatch", async () => {
    const req = {
      body: {
        nickname: "newuser",
        email: "newuser@example.com",
        password: "123456",
        confirmPassword: "654321",
        type: "user",
      },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await authController.registerUser(req, res);

    expect(res.status.calledWith(405)).to.be.true;
    expect(res.json.calledWithMatch({ description: "Passwords mismatch" })).to
      .be.true;
  });

  it("should return 406 if email already exists", async () => {
    const req = {
      body: {
        nickname: "existinguser",
        email: "exist@example.com",
        password: "123456",
        confirmPassword: "123456",
        type: "user",
      },
    };

    sinon.stub(User, "findOne").resolves({ email: "exist@example.com" });

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await authController.registerUser(req, res);

    expect(res.status.calledWith(406)).to.be.true;
    expect(res.json.calledWithMatch({ description: "Email already exists" })).to
      .be.true;
  });

  it("should return 409 when register is called while already logged in", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const secret = process.env.JWT_SECRET || "defaultsecret";
    const validToken = jwt.sign({ id: mockUserId }, secret);

    const req = {
      headers: {
        authorization: `Bearer ${validToken}`,
      },
      body: {
        nickname: "newuser",
        email: "newuser@example.com",
        password: "123456",
        confirmPassword: "123456",
        type: "user",
      },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await authController.registerUser(req, res);

    expect(res.status.calledWith(409)).to.be.true;
    expect(
      res.json.calledWithMatch({ description: "User has already logged in" }),
    ).to.be.true;
  });

  it("should NOT return 409 when register is called with an invalid token", (done) => {
    chai
      .request(app)
      .post("/api/auth/register")
      .set("Authorization", "Bearer faketoken123")
      .send({
        nickname: "TestUser",
        email: "newuser@example.com",
        password: "123456",
        type: "user",
      })
      .end((err, res) => {
        expect(res).to.not.have.status(409);
        done();
      });
  });
});

describe("Admin Panel Middleware Test", () => {
  it("should deny guest access to admin panel", () => {
    const req = { user: null };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
    const next = sinon.spy();

    admin(req, res, next);

    expect(res.status.calledWith(401)).to.be.true;
    expect(res.json.calledWithMatch({ status: "Failed" })).to.be.true;
    expect(next.called).to.be.false;
  });

  it("should deny normal user access to admin panel", () => {
    const req = { user: { type: "user" } };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
    const next = sinon.spy();

    admin(req, res, next);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWithMatch({ status: "Failed" })).to.be.true;
    expect(next.called).to.be.false;
  });

  it("should allow admin to proceed", () => {
    const req = { user: { type: "admin" } };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
    const next = sinon.spy();

    admin(req, res, next);

    expect(next.calledOnce).to.be.true;
  });
});

describe("Get My Reviews Function Test", () => {
  it("should load reviews for logged-in user", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockReviewId = new mongoose.Types.ObjectId();

    const req = { user: { id: mockUserId } };

    sinon.stub(Review, "find").returns({
      populate: sinon.stub().returnsThis(),
      sort: sinon.stub().resolves([
        {
          _id: mockReviewId,
          albumID: { title: "Test Album", artist: "Test Artist" },
          userID: { nickname: "testuser" },
          reviewRate: 5,
          reviewContent: "Great album!",
          reviewDate: new Date(),
          updateAt: new Date(),
        },
      ]),
    });

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.getMyReviews(req, res);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.have.property("responseCode", "200");
    expect(res.json.firstCall.args[0]).to.have.property("status", "Success");
    expect(res.json.firstCall.args[0]).to.have.property("totalReviews", 1);
    expect(res.json.firstCall.args[0].data[0]).to.have.property(
      "reviewID",
      mockReviewId,
    );
  });

  it("should return 401 for guest access to review list", async () => {
    const req = { user: null };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.getMyReviews(req, res);

    expect(res.status.calledWith(401)).to.be.true;
    expect(
      res.json.calledWithMatch({
        description: "Invalid or expired token",
      }),
    ).to.be.true;
  });
});

describe("Write Review Function Test", () => {
  it("should create a new review successfully", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockAlbumId = new mongoose.Types.ObjectId();
    const mockNewReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: mockUserId },
      body: {
        albumTitle: "Test Album",
        artistName: "Test Artist",
        reviewRate: 5,
        reviewContent: "Great album!",
      },
    };

    sinon.stub(Album, "findOne").resolves({ _id: mockAlbumId });
    sinon.stub(Review, "findOne").resolves(null);
    sinon.stub(Review, "create").resolves({
      _id: mockNewReviewId,
      albumID: mockAlbumId,
      userID: mockUserId,
      reviewRate: 5,
      reviewContent: "Great album!",
    });
    sinon.stub(Review, "findById").returns({
      populate: sinon.stub().returnsThis(),
      lean: sinon.stub().resolves({
        _id: mockNewReviewId,
        reviewRate: 5,
        reviewContent: "Great album!",
        reviewDate: new Date(),
        updateAt: new Date(),
      }),
    });

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.writeReview(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
  });

  it("should return 400 if required fields are missing", async () => {
    const mockUserId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: mockUserId },
      body: {
        albumTitle: "Test Album",
        artistName: "Test Artist",
        reviewRate: 5,
        // missing reviewContent
      },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.writeReview(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(
      res.json.calledWithMatch({
        description: "Missing required fields",
      }),
    ).to.be.true;
  });

  it("should return 408 if album not found", async () => {
    const mockUserId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: mockUserId },
      body: {
        albumTitle: "Non-existent Album",
        artistName: "Non-existent Artist",
        reviewRate: 5,
        reviewContent: "Great album!",
      },
    };

    sinon.stub(Album, "findOne").resolves(null);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.writeReview(req, res);

    expect(res.status.calledWith(408)).to.be.true;
    expect(
      res.json.calledWithMatch({
        description: "Album not found",
      }),
    ).to.be.true;
  });

  it("should return 410 if user has already reviewed this album", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockAlbumId = new mongoose.Types.ObjectId();
    const mockOldReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: mockUserId },
      body: {
        albumTitle: "Test Album",
        artistName: "Test Artist",
        reviewRate: 4,
        reviewContent: "Another review",
      },
    };

    sinon.stub(Album, "findOne").resolves({ _id: mockAlbumId });
    sinon.stub(Review, "findOne").resolves({
      _id: mockOldReviewId,
      albumID: mockAlbumId,
      userID: mockUserId,
    });

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.writeReview(req, res);

    expect(res.status.calledWith(410)).to.be.true;
    expect(
      res.json.calledWithMatch({
        description: "You have already reviewed this album",
      }),
    ).to.be.true;
  });

  it("should return 411 if reviewRate is not between 1 and 5", async () => {
    const mockUserId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: mockUserId },
      body: {
        albumTitle: "Test Album",
        artistName: "Test Artist",
        reviewRate: 6, // invalid rating
        reviewContent: "Great album!",
      },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.writeReview(req, res);

    expect(res.status.calledWith(411)).to.be.true;
    expect(
      res.json.calledWithMatch({
        description: "reviewRate must be between 1 and 5",
      }),
    ).to.be.true;
  });
});

describe("Update Review Function Test", () => {
  it("should update a review if user is the owner", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: mockUserId.toString() },
      params: { id: mockReviewId },
      body: { reviewRate: 4, reviewContent: "Updated content" },
    };

    const mockReview = {
      _id: mockReviewId,
      userID: mockUserId,
      save: sinon.stub().resolves(),
    };

    const findByIdStub = sinon.stub(Review, "findById");
    findByIdStub.onFirstCall().resolves(mockReview);
    findByIdStub
      .onSecondCall()
      .returns({ populate: sinon.stub().returnsThis() });

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.updateReview(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(mockReview.save.calledOnce).to.be.true;
  });

  it("should return 400 if required fields are missing for edit review", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: mockUserId },
      params: { id: mockReviewId },
      body: { reviewRate: 5 },
      // missing reviewContent
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.updateReview(req, res);

    expect(res.status.calledWith(400)).to.be.true;
    expect(
      res.json.calledWithMatch({
        description: "Missing required fields",
      }),
    ).to.be.true;
  });

  it("should return 401 if user is not logged in for edit review", async () => {
    const mockReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: null,
      params: { id: mockReviewId },
      body: { reviewContent: "Updated" },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.updateReview(req, res);

    expect(res.status.calledWith(401)).to.be.true;
    expect(
      res.json.calledWithMatch({
        description: "Invalid or expired token",
      }),
    ).to.be.true;
  });

  it("should return 403 if not owner edits review", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockOwnerId = new mongoose.Types.ObjectId();
    const mockReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: mockUserId },
      params: { id: mockReviewId },
      body: { reviewRate: 3, reviewContent: "Updated" },
    };

    sinon
      .stub(Review, "findById")
      .resolves({ _id: mockReviewId, userID: mockOwnerId });

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.updateReview(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(
      res.json.calledWithMatch({
        description: "You are not allowed to do this action",
      }),
    ).to.be.true;
  });

  it("should return 404 if review not found on edit", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const notFoundReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: mockUserId },
      params: { id: notFoundReviewId },
      body: { reviewRate: 2, reviewContent: "Updated" },
    };

    sinon.stub(Review, "findById").resolves(null);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.updateReview(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ description: "Review not found" })).to.be
      .true;
  });

  it("should return 411 if reviewRate is not between 1 and 5 for edit review", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: mockUserId },
      params: { id: mockReviewId },
      body: { reviewRate: 6, reviewContent: "Updated" }, // invalid rating
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.updateReview(req, res);

    expect(res.status.calledWith(411)).to.be.true;
    expect(
      res.json.calledWithMatch({
        description: "reviewRate must be between 1 and 5",
      }),
    ).to.be.true;
  });
});

describe("Delete Review Function Test", () => {
  it("should delete review if user is owner", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: mockUserId.toString() },
      params: { id: mockReviewId },
    };

    const mockReview = {
      _id: mockReviewId,
      userID: mockUserId,
      deleteOne: sinon.stub().resolves(),
    };

    sinon.stub(Review, "findById").resolves(mockReview);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.deleteReview(req, res);

    // Expect status 200 here
    expect(res.status.calledWith(200)).to.be.true;
    expect(mockReview.deleteOne.calledOnce).to.be.true;
  });

  it("should return 401 if not logged in to delete", async () => {
    const mockReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: null,
      params: { id: mockReviewId },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.deleteReview(req, res);

    expect(res.status.calledWith(401)).to.be.true;
    expect(
      res.json.calledWithMatch({
        description: "Invalid or expired token",
      }),
    ).to.be.true;
  });

  it("should return 403 if user is not owner and tries delete", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockOwnerId = new mongoose.Types.ObjectId();
    const mockReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: mockUserId },
      params: { id: mockReviewId },
    };

    sinon
      .stub(Review, "findById")
      .resolves({ _id: mockReviewId, userID: mockOwnerId });

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.deleteReview(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(
      res.json.calledWithMatch({
        description: "You are not allowed to do this action",
      }),
    ).to.be.true;
  });

  it("should return 404 if review to delete does not exist", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const notFoundReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: mockUserId },
      params: { id: notFoundReviewId },
    };

    sinon.stub(Review, "findById").resolves(null);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.deleteReview(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ description: "Review not found" })).to.be
      .true;
  });
});

describe("Admin Get All Reviews Function Test", () => {
  it("should return 200 and get all reviews when admin access", async () => {
    const mockReviewId = new mongoose.Types.ObjectId();
    const mockUserId = new mongoose.Types.ObjectId();
    const mockAlbumId = new mongoose.Types.ObjectId();

    const req = {
      user: { type: "admin", id: mockUserId },
    };

    sinon.stub(Review, "find").returns({
      populate: sinon.stub().returnsThis(),
      sort: sinon.stub().resolves([
        {
          _id: mockReviewId,
          albumID: { title: "Album", artist: "Artist", coverImageUrl: "url" },
          userID: { nickname: "user", email: "user@test.com", type: "user" },
          reviewRate: 5,
          reviewContent: "Great!",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]),
    });

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.getAllReviews(req, res);

    expect(res.json.calledOnce).to.be.true;
    expect(res.json.firstCall.args[0]).to.have.property("responseCode", "200");
    expect(res.json.firstCall.args[0]).to.have.property("status", "Success");
    expect(res.json.firstCall.args[0]).to.have.property("totalReviews", 1);
  });

  it("should return 401 when guest access admin view reviews", async () => {
    const req = {
      user: null,
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.getAllReviews(req, res);

    expect(res.status.calledWith(401)).to.be.true;
    expect(
      res.json.calledWithMatch({
        description: "Invalid or expired token",
      }),
    ).to.be.true;
  });

  it("should return 403 when non-admin user access admin view reviews", async () => {
    const mockUserId = new mongoose.Types.ObjectId();

    const req = {
      user: { type: "user", id: mockUserId },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.getAllReviews(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(
      res.json.calledWithMatch({
        description: "You are not allowed to do this action",
      }),
    ).to.be.true;
  });
});

describe("Admin Delete Review Function Test", () => {
  it("should return 401 when guest deletes review by admin endpoint", async () => {
    const mockReviewId = new mongoose.Types.ObjectId().toString();

    const req = {
      user: null,
      params: { id: mockReviewId },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await adminController.deleteReviewByAdmin(req, res);

    expect(res.status.calledWith(401)).to.be.true;
    expect(
      res.json.calledWithMatch({
        description: "Invalid or expired token",
      }),
    ).to.be.true;
  });

  it("should return 403 when non-admin user deletes review by admin endpoint", async () => {
    const mockReviewId = new mongoose.Types.ObjectId().toString();

    const req = {
      user: { type: "user" },
      params: { id: mockReviewId },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await adminController.deleteReviewByAdmin(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(
      res.json.calledWithMatch({
        description: "You are not allowed to do this action",
      }),
    ).to.be.true;
  });

  it("should return 200 when admin deletes review successfully", async () => {
    const mockReviewId = new mongoose.Types.ObjectId().toString();

    const req = {
      user: { type: "admin" },
      params: { id: mockReviewId },
    };

    const mockReview = {
      _id: mockReviewId,
      deleteOne: sinon.stub().resolves(),
    };

    sinon.stub(Review, "findById").resolves(mockReview);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await adminController.deleteReviewByAdmin(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(
      res.json.calledWithMatch({
        description: "Review deleted successfully",
      }),
    ).to.be.true;
  });

  it("should return 404 when admin tries delete review not found", async () => {
    const notFoundReviewId = new mongoose.Types.ObjectId().toString();

    const req = {
      user: { type: "admin" },
      params: { id: notFoundReviewId },
    };

    sinon.stub(Review, "findById").resolves(null);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await adminController.deleteReviewByAdmin(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ description: "Review not found" })).to.be
      .true;
  });
});
