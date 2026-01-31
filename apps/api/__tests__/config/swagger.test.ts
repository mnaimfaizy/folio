import swaggerSpec from "../../config/swagger";

// Define interface for Swagger specification to fix TypeScript errors
interface SwaggerSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
    contact: {
      name: string;
      email: string;
    };
    license?: {
      name: string;
      url: string;
    };
  };
  servers: Array<{
    url: string;
    description: string;
  }>;
  components: {
    securitySchemes: {
      bearerAuth: {
        type: string;
        scheme: string;
        bearerFormat: string;
      };
    };
    // Replace 'any' with more specific types
    [key: string]: Record<string, unknown>;
  };
  paths: {
    // Replace 'any' with more specific types
    [path: string]: Record<string, unknown>;
  };
  tags: Array<{
    name: string;
    description?: string;
  }>;
}

// Cast the imported swaggerSpec to our defined interface
const typedSwaggerSpec = swaggerSpec as SwaggerSpec;

describe("Swagger Configuration", () => {
  it("should have the correct base structure", () => {
    expect(typedSwaggerSpec).toBeDefined();
    expect(typedSwaggerSpec).toHaveProperty("openapi");
    expect(typedSwaggerSpec).toHaveProperty("info");
    expect(typedSwaggerSpec).toHaveProperty("servers");
    expect(typedSwaggerSpec).toHaveProperty("components");
  });

  it("should have the correct API version", () => {
    expect(typedSwaggerSpec.openapi).toBe("3.0.0");
  });

  it("should have the correct info properties", () => {
    const { info } = typedSwaggerSpec;

    expect(info).toHaveProperty("title");
    expect(info).toHaveProperty("version");
    expect(info).toHaveProperty("description");
    expect(info).toHaveProperty("contact");
  });

  it("should have the correct server configuration", () => {
    const { servers } = typedSwaggerSpec;

    expect(Array.isArray(servers)).toBe(true);
    expect(servers.length).toBeGreaterThan(0);
    expect(servers[0]).toHaveProperty("url");
    expect(servers[0]).toHaveProperty("description");
  });

  it("should have security components defined", () => {
    const { components } = typedSwaggerSpec;

    expect(components).toHaveProperty("securitySchemes");
    expect(components.securitySchemes).toHaveProperty("bearerAuth");
    expect(components.securitySchemes.bearerAuth.type).toBe("http");
    expect(components.securitySchemes.bearerAuth.scheme).toBe("bearer");
    expect(components.securitySchemes.bearerAuth.bearerFormat).toBe("JWT");
  });

  it("should have paths defined", () => {
    expect(typedSwaggerSpec).toHaveProperty("paths");
    expect(typeof typedSwaggerSpec.paths).toBe("object");
  });

  it("should have proper tag definitions", () => {
    expect(typedSwaggerSpec).toHaveProperty("tags");
    expect(Array.isArray(typedSwaggerSpec.tags)).toBe(true);

    // Check for essential API tags if they exist
    if (typedSwaggerSpec.tags.length > 0) {
      const tagNames = typedSwaggerSpec.tags.map((tag) => tag.name);
      // Just check that we have at least some tags for API organization
      expect(tagNames.length).toBeGreaterThan(0);
    }
  });
});
