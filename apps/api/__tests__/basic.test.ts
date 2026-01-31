import path from "path";

describe("Basic API tests", () => {
  it("should pass a simple test", () => {
    expect(true).toBe(true);
  });

  it("should verify the environment is correctly set up", () => {
    expect(process.env.NODE_ENV).not.toBe("production");
  });

  it("should be able to resolve file paths", () => {
    const testPath = path.resolve(__dirname, "../index.ts");
    expect(typeof testPath).toBe("string");
  });
});
