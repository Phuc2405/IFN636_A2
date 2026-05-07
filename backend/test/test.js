const chai = require("chai");
const chaiHttp = require("chai-http");
const mongoose = require("mongoose");
const sinon = require("sinon");
const bcrypt = require("bcrypt");
const { expect } = chai;

const User = require("../models/User");
const Album = require("../models/Album");
const Review = require("../models/Review");

const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");
const adminController = require("../controllers/adminController");
const admin = require("../middleware/adminMiddleware");

chai.use(chaiHttp);

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
    expect(res.json.firstCall.args[0].Data).to.include({
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
    expect(res.json.calledWithMatch({ Description: "Missing required fields" }))
      .to.be.true;
  });

  it("should return 401 for incorrect username or password", async () => {
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

    expect(res.status.calledWith(401)).to.be.true;
    expect(
      res.json.calledWithMatch({ Description: "Invalid email or password" }),
    ).to.be.true;
  });

  it("should return 401 when email does not exist", async () => {
    const req = {
      body: { email: "notfound@example.com", password: "any" },
    };

    sinon.stub(User, "findOne").resolves(null);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };
    await authController.loginUser(req, res);

    expect(res.status.calledWith(401)).to.be.true;
    expect(
      res.json.calledWithMatch({ Description: "Invalid email or password" }),
    ).to.be.true;
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
    expect(res.json.calledWithMatch({ Description: "Invalid email format" })).to
      .be.true;
  });

  it("should return 409 when login is called while already logged in", async () => {
    const mockUserId = new mongoose.Types.ObjectId();

    const req = {
      headers: {
        authorization: "Bearer token",
      },
      body: { email: "testuser@example.com", password: "correctpassword" },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await authController.loginUser(req, res);

    expect(res.status.calledWith(409)).to.be.true;
    expect(
      res.json.calledWithMatch({ Description: "User has already logged in" }),
    ).to.be.true;
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
    expect(res.json.firstCall.args[0].Data).to.include({
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
    expect(res.json.calledWithMatch({ Description: "Missing required fields" }))
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
    expect(res.json.calledWithMatch({ Description: "Invalid email format" })).to
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
    expect(res.json.calledWithMatch({ Description: "Passwords mismatch" })).to
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
    expect(res.json.calledWithMatch({ Description: "Email already exists" })).to
      .be.true;
  });

  it("should return 409 when register is called while already logged in", async () => {
    const mockUserId = new mongoose.Types.ObjectId();

    const req = {
      headers: {
        authorization: "Bearer token",
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
      res.json.calledWithMatch({ Description: "User has already logged in" }),
    ).to.be.true;
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

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Access denied. Admin only." }))
      .to.be.true;
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
    expect(res.json.calledWithMatch({ message: "Access denied. Admin only." }))
      .to.be.true;
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
      sort: sinon.stub().resolves([{ _id: mockReviewId }]),
    });

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.getMyReviews(req, res);

    expect(res.json.calledWithMatch([{ _id: mockReviewId }])).to.be.true;
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
        message: "You must be logged in to view your reviews",
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
        albumID: mockAlbumId,
        reviewRate: 5,
        reviewContent: "Great album!",
      },
    };

    sinon.stub(Album, "findById").resolves({ _id: mockAlbumId });
    sinon.stub(Review, "findOne").resolves(null);
    sinon
      .stub(Review, "create")
      .resolves({ _id: mockNewReviewId, ...req.body, userID: mockUserId });
    sinon
      .stub(Review, "findById")
      .returns({ populate: sinon.stub().returnsThis() });

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.writeReview(req, res);

    expect(res.status.calledWith(201)).to.be.true;
    expect(res.json.calledOnce).to.be.true;
  });

  it("should return 400 if user has already reviewed this album", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockAlbumId = new mongoose.Types.ObjectId();
    const mockOldReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: mockUserId },
      body: {
        albumID: mockAlbumId,
        reviewRate: 4,
        reviewContent: "Another review",
      },
    };

    sinon.stub(Album, "findById").resolves({ _id: mockAlbumId });
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

    expect(res.status.calledWith(400)).to.be.true;
    expect(
      res.json.calledWithMatch({
        message: "You have already reviewed this album",
      }),
    ).to.be.true;
  });

  it("should return 401 if user is not logged in for write review", async () => {
    const req = { user: null };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.writeReview(req, res);

    expect(res.status.calledWith(401)).to.be.true;
  });
});

describe("Update Review Function Test", () => {
  it("should update a review if user is the owner", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: mockUserId.toString() },
      params: { id: mockReviewId },
      body: { reviewContent: "Updated content" },
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

  it("should return 404 if review not found on edit", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const notFoundReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: mockUserId },
      params: { id: notFoundReviewId },
      body: { reviewContent: "Updated" },
    };

    sinon.stub(Review, "findById").resolves(null);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await reviewController.updateReview(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Review not found" })).to.be
      .true;
  });

  it("should return 403 if not owner edits review", async () => {
    const mockUserId = new mongoose.Types.ObjectId();
    const mockOwnerId = new mongoose.Types.ObjectId();
    const mockReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: { id: mockUserId },
      params: { id: mockReviewId },
      body: { reviewContent: "Updated" },
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
        message: "You are not allowed to edit this review",
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
        message: "You are not allowed to delete this review",
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
  });
});

describe("Admin Delete Review Function Test", () => {
  it("should be forbidden when non-admin users deletes review by admin endpoint", async () => {
    const mockReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: { type: "user" },
      params: { reviewID: mockReviewId },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await adminController.deleteReviewByAdmin(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Access denied. Admins only." }))
      .to.be.true;
  });

  it("should be forbidden when guest deletes review by admin endpoint", async () => {
    const mockReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: null,
      params: { reviewID: mockReviewId },
    };

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await adminController.deleteReviewByAdmin(req, res);

    expect(res.status.calledWith(403)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Access denied. Admins only." }))
      .to.be.true;
  });

  it("should delete review by admin endpoint successfully", async () => {
    const mockReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: { type: "admin" },
      params: { reviewID: mockReviewId },
    };

    sinon.stub(Review, "findById").resolves({ _id: mockReviewId });
    sinon.stub(Review, "findByIdAndDelete").resolves({ _id: mockReviewId });

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await adminController.deleteReviewByAdmin(req, res);

    expect(res.status.calledWith(200)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Review deleted successfully" }))
      .to.be.true;
  });

  it("should return 404 when admin delete review not found", async () => {
    const notFoundReviewId = new mongoose.Types.ObjectId();

    const req = {
      user: { type: "admin" },
      params: { reviewID: notFoundReviewId },
    };

    sinon.stub(Review, "findById").resolves(null);

    const res = {
      status: sinon.stub().returnsThis(),
      json: sinon.spy(),
    };

    await adminController.deleteReviewByAdmin(req, res);

    expect(res.status.calledWith(404)).to.be.true;
    expect(res.json.calledWithMatch({ message: "Review not found" })).to.be
      .true;
  });
});
