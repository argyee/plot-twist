/**
 * Tests for mediaRequestModal.js
 * Tests modal creation utility for Overseerr movie requests
 */

const {buildRequestModal} = require("../src/utils/mediaRequestModal");

describe("Media Request Modal Builder", () => {
    describe("Basic Modal Creation", () => {
        test("should create modal with correct custom ID for button request", () => {
            const modal = buildRequestModal("550", "Fight Club", false);

            expect(modal.data.custom_id).toBe("request_modal_550");
        });

        test("should create modal with correct custom ID for quick request", () => {
            const modal = buildRequestModal("550", "Fight Club", true);

            expect(modal.data.custom_id).toBe("quick_request_modal_550");
        });

        test("should include movie title in modal title when provided", () => {
            const modal = buildRequestModal("550", "Fight Club", false);

            expect(modal.data.title).toContain("Fight Club");
        });

        test("should use generic title when movie title is null", () => {
            const modal = buildRequestModal("550", null, false);

            expect(modal.data.title).toBe("Request Movie on Plex");
        });
    });

    describe("Modal Components", () => {
        test("should have quality input component", () => {
            const modal = buildRequestModal("550", "Fight Club", false);

            const qualityRow = modal.components[0];
            expect(qualityRow).toBeDefined();

            const qualityInput = qualityRow.components[0];
            expect(qualityInput.data.custom_id).toBe("quality");
            expect(qualityInput.data.label).toBeDefined();
        });

        test("should have required quality input field", () => {
            const modal = buildRequestModal("550", "Fight Club", false);

            const qualityInput = modal.components[0].components[0];
            expect(qualityInput.data.required).toBe(false); // Not required, can be empty
        });

        test("should have placeholder text in quality input", () => {
            const modal = buildRequestModal("550", "Fight Club", false);

            const qualityInput = modal.components[0].components[0];
            expect(qualityInput.data.placeholder).toBeDefined();
            expect(qualityInput.data.placeholder.length).toBeGreaterThan(0);
        });
    });

    describe("Different Request Types", () => {
        test("should create button request modal correctly", () => {
            const modal = buildRequestModal("123", "The Matrix", false);

            expect(modal.data.custom_id).toBe("request_modal_123");
            expect(modal.data.title).toContain("The Matrix");
        });

        test("should create quick request modal correctly", () => {
            const modal = buildRequestModal("456", "Inception", true);

            expect(modal.data.custom_id).toBe("quick_request_modal_456");
            expect(modal.data.title).toContain("Inception");
        });

        test("should handle different movie IDs", () => {
            const modal1 = buildRequestModal("1", null, false);
            const modal2 = buildRequestModal("999999", null, false);

            expect(modal1.data.custom_id).toBe("request_modal_1");
            expect(modal2.data.custom_id).toBe("request_modal_999999");
        });
    });

    describe("Edge Cases", () => {
        test("should handle empty string movie title", () => {
            const modal = buildRequestModal("550", "", false);

            // Should use generic title if empty string
            expect(modal.data.title).toBe("Request Movie on Plex");
        });

        test("should create consistent structure regardless of isQuickRequest flag", () => {
            const modal1 = buildRequestModal("550", "Test", false);
            const modal2 = buildRequestModal("550", "Test", true);

            // Both should have same number of components
            expect(modal1.components.length).toBe(modal2.components.length);

            // Both should have quality input
            expect(modal1.components[0].components[0].data.custom_id).toBe("quality");
            expect(modal2.components[0].components[0].data.custom_id).toBe("quality");
        });
    });
});
