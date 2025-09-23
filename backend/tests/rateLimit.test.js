import request from "supertest";
import app from "../index.js";

describe("Rate Limiting", () => {
    // Global limiter: 100 req / 15min
    test("should allow requests under the global limit", async () => {
        const res = await request(app).get("/weather");
        expect([200, 234]).toContain(res.status); // some routes return 234
    });

    // Booking limiter: 10 req / 1min
    test("should block requests after exceeding booking limit", async () => {
        // Send 11 requests quickly
        let lastResponse;
        for (let i = 1; i <= 11; i++) {
            lastResponse = await request(app).get("/booking");
        }

        // The last one should be blocked
        expect(lastResponse.status).toBe(429);
        expect(lastResponse.body).toHaveProperty(
            "error",
            "Too many booking requests, please try again later."
        );
    });
});
