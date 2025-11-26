import { type Server, createServer } from "node:http";
import type { Express } from "express";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);
  
  app.get("/api/user", async (req, res) => {
    const user = req.user as any;
    
    if (!req.isAuthenticated() || !user?.claims?.sub) {
      return res.json(null);
    }

    try {
      const dbUser = await storage.getUser(user.claims.sub);
      res.json(dbUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/stats", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    try {
      const stats = await storage.getStats(user?.claims?.sub);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/indicators", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    try {
      const indicators = await storage.getIndicators(user?.claims?.sub);
      res.json(indicators);
    } catch (error) {
      console.error("Error fetching indicators:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/indicators", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    try {
      const { title, description, criteria: criteriaList } = req.body;
      
      const indicator = await storage.createIndicator({
        title,
        description,
        userId: user.claims.sub,
        status: "pending",
      });

      if (criteriaList && Array.isArray(criteriaList)) {
        for (let i = 0; i < criteriaList.length; i++) {
          const criteriaTitle = criteriaList[i];
          if (criteriaTitle && typeof criteriaTitle === "string") {
            await storage.createCriteria({
              title: criteriaTitle,
              indicatorId: indicator.id,
              order: i + 1,
            });
          }
        }
      }

      const fullIndicator = await storage.getIndicator(indicator.id);
      res.json(fullIndicator);
    } catch (error) {
      console.error("Error creating indicator:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/indicators/:id", isAuthenticated, async (req, res) => {
    try {
      const indicator = await storage.getIndicator(req.params.id);
      if (!indicator) {
        return res.status(404).json({ message: "Indicator not found" });
      }
      res.json(indicator);
    } catch (error) {
      console.error("Error fetching indicator:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/indicators/:id", isAuthenticated, async (req, res) => {
    try {
      const updated = await storage.updateIndicator(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Indicator not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating indicator:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/indicators/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteIndicator(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting indicator:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/indicators/:indicatorId/criteria/:criteriaId", isAuthenticated, async (req, res) => {
    try {
      const { isCompleted } = req.body;
      const updated = await storage.updateCriteria(req.params.criteriaId, { isCompleted });
      
      if (!updated) {
        return res.status(404).json({ message: "Criteria not found" });
      }

      const allCriteria = await storage.getCriteria(req.params.indicatorId);
      const allCompleted = allCriteria.every(c => c.isCompleted);
      const anyCompleted = allCriteria.some(c => c.isCompleted);
      
      let status: "pending" | "in_progress" | "completed" = "pending";
      if (allCompleted) {
        status = "completed";
      } else if (anyCompleted) {
        status = "in_progress";
      }
      
      await storage.updateIndicator(req.params.indicatorId, { status });
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating criteria:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/indicators/:id/witnesses", isAuthenticated, async (req, res) => {
    try {
      const witnesses = await storage.getWitnesses(req.params.id);
      res.json(witnesses);
    } catch (error) {
      console.error("Error fetching witnesses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/indicators/:id/witnesses", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    try {
      const { title, description, criteriaId, fileType } = req.body;
      
      const witness = await storage.createWitness({
        title,
        description,
        indicatorId: req.params.id,
        criteriaId,
        fileType,
        userId: user.claims.sub,
      });
      
      res.json(witness);
    } catch (error) {
      console.error("Error creating witness:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/witnesses/:id", isAuthenticated, async (req, res) => {
    try {
      await storage.deleteWitness(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting witness:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/strategies", isAuthenticated, async (req, res) => {
    try {
      const strategies = await storage.getStrategies();
      res.json(strategies);
    } catch (error) {
      console.error("Error fetching strategies:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/user-strategies", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    try {
      const strategies = await storage.getUserStrategies(user.claims.sub);
      res.json(strategies);
    } catch (error) {
      console.error("Error fetching user strategies:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user-strategies", isAuthenticated, async (req, res) => {
    const user = req.user as any;
    try {
      const { strategyIds } = req.body;
      
      if (!Array.isArray(strategyIds)) {
        return res.status(400).json({ message: "strategyIds must be an array" });
      }
      
      await storage.setUserStrategies(user.claims.sub, strategyIds);
      const strategies = await storage.getUserStrategies(user.claims.sub);
      res.json(strategies);
    } catch (error) {
      console.error("Error setting user strategies:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/capabilities", isAuthenticated, async (req, res) => {
    try {
      const capabilities = await storage.getCapabilities();
      res.json(capabilities);
    } catch (error) {
      console.error("Error fetching capabilities:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/changes", isAuthenticated, async (req, res) => {
    try {
      const changes = await storage.getChanges();
      res.json(changes);
    } catch (error) {
      console.error("Error fetching changes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/indicators/re-evaluate", isAuthenticated, async (req, res) => {
    try {
      const { indicatorIds } = req.body;
      
      if (!Array.isArray(indicatorIds) || indicatorIds.length === 0) {
        return res.status(400).json({ message: "indicatorIds must be a non-empty array" });
      }
      
      await storage.reEvaluateIndicators(indicatorIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Error re-evaluating indicators:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return createServer(app);
}
