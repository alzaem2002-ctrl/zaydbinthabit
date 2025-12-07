import { type Server, createServer } from "node:http";
import type { Express } from "express";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, isPrincipal, isCreator, getUserIdFromRequest } from "./replitAuth";
import { randomBytes } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  await setupAuth(app);
  
  // Health check endpoint - doesn't require database
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      service: "School Performance Documentation System"
    });
  });
  
  // Custom login endpoint for role-based authentication
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { role, name, password } = req.body;

      if (!role || !["teacher", "admin", "creator"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }

      // Teacher login - create or find by name
      if (role === "teacher") {
        if (!name || typeof name !== "string" || name.trim().length < 2) {
          return res.status(400).json({ message: "يرجى إدخال اسم صحيح" });
        }

        const trimmedName = name.trim();
        const nameParts = trimmedName.split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ") || "";

        // Check if teacher with this name exists
        let existingTeacher = await storage.findTeacherByName(firstName, lastName);
        
        if (existingTeacher) {
          // Login with existing teacher
          (req.session as any).userId = existingTeacher.id;
          (req.session as any).userRole = "teacher";
          await new Promise<void>((resolve, reject) => {
            req.session.save((err) => {
              if (err) reject(err);
              else resolve();
            });
          });
          return res.json({ success: true, user: existingTeacher });
        }

        // Create new teacher
        const uniqueId = `teacher_${randomBytes(8).toString("hex")}`;
        const newTeacher = await storage.upsertUser({
          id: uniqueId,
          firstName,
          lastName,
          email: `${uniqueId}@school.local`,
          role: "teacher",
          schoolName: "زيد بن ثابت الابتدائية",
          principalName: "زياد عبدالمحسن العتيبي",
        });

        // Seed default indicators for new teacher
        await storage.seedDefaultIndicators(newTeacher.id);

        (req.session as any).userId = newTeacher.id;
        (req.session as any).userRole = "teacher";
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        return res.json({ success: true, user: newTeacher });
      }

      // Admin (Principal) login - check school password
      if (role === "admin") {
        const adminPassword = process.env.ADMIN_PASSWORD;
        
        if (!adminPassword) {
          return res.status(500).json({ message: "لم يتم تعيين الرقم السري للمدير" });
        }

        if (password !== adminPassword) {
          return res.status(401).json({ message: "الرقم السري غير صحيح" });
        }

        // Find or create admin user
        let adminUser = await storage.findUserByRole("admin");
        
        if (!adminUser) {
          const uniqueId = `admin_${randomBytes(8).toString("hex")}`;
          adminUser = await storage.upsertUser({
            id: uniqueId,
            firstName: "زياد",
            lastName: "عبدالمحسن العتيبي",
            email: `admin@school.local`,
            role: "admin",
            schoolName: "زيد بن ثابت الابتدائية",
            principalName: "زياد عبدالمحسن العتيبي",
          });
        }

        (req.session as any).userId = adminUser.id;
        (req.session as any).userRole = "admin";
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        return res.json({ success: true, user: adminUser });
      }

      // Creator login - check creator password
      if (role === "creator") {
        const creatorPassword = process.env.CREATOR_PASSWORD;
        
        if (!creatorPassword) {
          return res.status(500).json({ message: "لم يتم تعيين الرقم السري لمنشئ الموقع" });
        }

        if (password !== creatorPassword) {
          return res.status(401).json({ message: "الرقم السري غير صحيح" });
        }

        // Find or create creator user
        let creatorUser = await storage.findUserByRole("creator");
        
        if (!creatorUser) {
          const uniqueId = `creator_${randomBytes(8).toString("hex")}`;
          creatorUser = await storage.upsertUser({
            id: uniqueId,
            firstName: "عبدالعزيز",
            lastName: "الخلفان",
            email: `creator@school.local`,
            role: "creator",
          });
        }

        (req.session as any).userId = creatorUser.id;
        (req.session as any).userRole = "creator";
        await new Promise<void>((resolve, reject) => {
          req.session.save((err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        return res.json({ success: true, user: creatorUser });
      }

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تسجيل الدخول" });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "حدث خطأ أثناء تسجيل الخروج" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true });
    });
  });
  
  app.get("/api/user", async (req, res) => {
    try {
      // Check session-based auth first (custom login)
      const sessionUserId = (req.session as any)?.userId;
      if (sessionUserId) {
        const dbUser = await storage.getUser(sessionUserId);
        return res.json(dbUser);
      }

      // Fall back to Replit OAuth
      const user = req.user as any;
      if (!req.isAuthenticated() || !user?.claims?.sub) {
        return res.json(null);
      }

      const dbUser = await storage.getUser(user.claims.sub);
      res.json(dbUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/user", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { firstName, lastName, educationalLevel, schoolName, educationDepartment, subject, yearsOfService, contactEmail } = req.body;
      
      const updated = await storage.updateUser(userId, {
        firstName,
        lastName,
        educationalLevel,
        schoolName,
        educationDepartment,
        subject,
        yearsOfService,
        contactEmail,
      });

      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const stats = await storage.getStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/indicators", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const indicators = await storage.getIndicators(userId);
      res.json(indicators);
    } catch (error) {
      console.error("Error fetching indicators:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/indicators", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { title, description, criteria: criteriaList } = req.body;
      
      const indicator = await storage.createIndicator({
        title,
        description,
        userId,
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
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const indicator = await storage.getIndicator(req.params.id);
      if (!indicator) {
        return res.status(404).json({ message: "Indicator not found" });
      }
      if (indicator.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      res.json(indicator);
    } catch (error) {
      console.error("Error fetching indicator:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/indicators/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const indicator = await storage.getIndicator(req.params.id);
      if (!indicator) {
        return res.status(404).json({ message: "Indicator not found" });
      }
      if (indicator.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const { title, description, status, order } = req.body;
      const safeUpdate: { title?: string; description?: string; status?: string; order?: number } = {};
      if (title !== undefined) safeUpdate.title = title;
      if (description !== undefined) safeUpdate.description = description;
      if (status !== undefined) safeUpdate.status = status;
      if (order !== undefined) safeUpdate.order = order;
      
      const updated = await storage.updateIndicator(req.params.id, safeUpdate);
      res.json(updated);
    } catch (error) {
      console.error("Error updating indicator:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/indicators/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const indicator = await storage.getIndicator(req.params.id);
      if (!indicator) {
        return res.status(404).json({ message: "Indicator not found" });
      }
      if (indicator.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      await storage.deleteIndicator(req.params.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting indicator:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/indicators/:indicatorId/criteria/:criteriaId", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const indicator = await storage.getIndicator(req.params.indicatorId);
      if (!indicator) {
        return res.status(404).json({ message: "Indicator not found" });
      }
      if (indicator.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const criterion = await storage.getCriteriaById(req.params.criteriaId);
      if (!criterion) {
        return res.status(404).json({ message: "Criteria not found" });
      }
      if (criterion.indicatorId !== req.params.indicatorId) {
        return res.status(403).json({ message: "Criteria does not belong to this indicator" });
      }

      const { isCompleted } = req.body;
      const updated = await storage.updateCriteria(req.params.criteriaId, { isCompleted });

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
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const indicator = await storage.getIndicator(req.params.id);
      if (!indicator) {
        return res.status(404).json({ message: "Indicator not found" });
      }
      if (indicator.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const witnesses = await storage.getWitnesses(req.params.id);
      res.json(witnesses);
    } catch (error) {
      console.error("Error fetching witnesses:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/indicators/:id/witnesses", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const indicator = await storage.getIndicator(req.params.id);
      if (!indicator) {
        return res.status(404).json({ message: "Indicator not found" });
      }
      if (indicator.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const { title, description, criteriaId, fileType } = req.body;
      
      if (criteriaId) {
        const criterion = await storage.getCriteriaById(criteriaId);
        if (!criterion) {
          return res.status(404).json({ message: "Criteria not found" });
        }
        if (criterion.indicatorId !== req.params.id) {
          return res.status(400).json({ message: "Criteria does not belong to this indicator" });
        }
      }
      
      const witness = await storage.createWitness({
        title,
        description,
        indicatorId: req.params.id,
        criteriaId,
        fileType,
        userId,
      });
      
      res.json(witness);
    } catch (error) {
      console.error("Error creating witness:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/witnesses/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const witness = await storage.getWitnessById(req.params.id);
      if (!witness) {
        return res.status(404).json({ message: "Witness not found" });
      }
      if (witness.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }
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
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const strategies = await storage.getUserStrategies(userId);
      res.json(strategies);
    } catch (error) {
      console.error("Error fetching user strategies:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/user-strategies", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { strategyIds } = req.body;
      
      if (!Array.isArray(strategyIds)) {
        return res.status(400).json({ message: "strategyIds must be an array" });
      }
      
      await storage.setUserStrategies(userId, strategyIds);
      const strategies = await storage.getUserStrategies(userId);
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
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { indicatorIds } = req.body;
      
      if (!Array.isArray(indicatorIds) || indicatorIds.length === 0) {
        return res.status(400).json({ message: "indicatorIds must be a non-empty array" });
      }
      
      for (const id of indicatorIds) {
        const indicator = await storage.getIndicator(id);
        if (!indicator) {
          return res.status(404).json({ message: `Indicator ${id} not found` });
        }
        if (indicator.userId !== userId) {
          return res.status(403).json({ message: "Access denied" });
        }
      }
      
      await storage.reEvaluateIndicators(indicatorIds);
      res.json({ success: true });
    } catch (error) {
      console.error("Error re-evaluating indicators:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // SIGNATURE ROUTES - Teacher submits for approval
  // =====================================================

  // Teacher: Submit indicator for approval
  app.post("/api/signatures", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { indicatorId } = req.body;
      
      if (!indicatorId) {
        return res.status(400).json({ message: "indicatorId is required" });
      }

      const indicator = await storage.getIndicator(indicatorId);
      if (!indicator) {
        return res.status(404).json({ message: "Indicator not found" });
      }
      if (indicator.userId !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const signature = await storage.createSignature({
        indicatorId,
        teacherId: userId,
        status: "pending",
      });

      res.json(signature);
    } catch (error) {
      console.error("Error creating signature:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Teacher: Get my signatures
  app.get("/api/my-signatures", isAuthenticated, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const signatures = await storage.getSignaturesByTeacher(userId);
      res.json(signatures);
    } catch (error) {
      console.error("Error fetching signatures:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // =====================================================
  // PRINCIPAL ROUTES - Admin access only
  // =====================================================

  // Principal: Get dashboard stats
  app.get("/api/principal/stats", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const stats = await storage.getPrincipalStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching principal stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Principal: Get all teachers with their stats
  app.get("/api/principal/teachers", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const teachers = await storage.getAllTeachers();
      res.json(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Principal: Get all indicators for a specific teacher
  app.get("/api/principal/teachers/:teacherId/indicators", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const indicators = await storage.getIndicators(req.params.teacherId);
      res.json(indicators);
    } catch (error) {
      console.error("Error fetching teacher indicators:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Principal: Get pending signatures
  app.get("/api/principal/pending-signatures", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const signatures = await storage.getPendingSignatures();
      res.json(signatures);
    } catch (error) {
      console.error("Error fetching pending signatures:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Principal: Approve a signature
  app.post("/api/principal/signatures/:id/approve", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { notes } = req.body;
      const signature = await storage.approveSignature(req.params.id, userId, notes);
      
      if (!signature) {
        return res.status(404).json({ message: "Signature not found" });
      }
      
      res.json(signature);
    } catch (error) {
      console.error("Error approving signature:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Principal: Reject a signature
  app.post("/api/principal/signatures/:id/reject", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const userId = await getUserIdFromRequest(req);
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const { notes } = req.body;
      
      if (!notes) {
        return res.status(400).json({ message: "Notes are required when rejecting" });
      }
      
      const signature = await storage.rejectSignature(req.params.id, userId, notes);
      
      if (!signature) {
        return res.status(404).json({ message: "Signature not found" });
      }
      
      res.json(signature);
    } catch (error) {
      console.error("Error rejecting signature:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Principal: Update user role (can only set admin, supervisor, teacher)
  app.patch("/api/principal/users/:userId/role", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const { role } = req.body;
      
      if (!role || !["admin", "supervisor", "teacher"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const updated = await storage.updateUser(req.params.userId, { role });
      
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Creator-only routes (site management)
  
  // Creator: Get all users
  app.get("/api/creator/users", isAuthenticated, isCreator, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching all users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Creator: Update any user role (can set any role including creator)
  app.patch("/api/creator/users/:userId/role", isAuthenticated, isCreator, async (req, res) => {
    try {
      const { role } = req.body;
      
      if (!role || !["creator", "admin", "supervisor", "teacher"].includes(role)) {
        return res.status(400).json({ message: "Invalid role" });
      }
      
      const updated = await storage.updateUserRole(req.params.userId, role);
      
      if (!updated) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Creator: Get site statistics
  app.get("/api/creator/stats", isAuthenticated, isCreator, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const stats = {
        totalUsers: allUsers.length,
        creators: allUsers.filter(u => u.role === "creator").length,
        admins: allUsers.filter(u => u.role === "admin").length,
        supervisors: allUsers.filter(u => u.role === "supervisor").length,
        teachers: allUsers.filter(u => u.role === "teacher").length,
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching creator stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Principal/Creator: Delete a teacher
  app.delete("/api/principal/teachers/:userId", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const targetUser = await storage.getUser(req.params.userId);
      
      if (!targetUser) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      // Only allow deleting teachers (not admins or creators)
      if (targetUser.role !== "teacher") {
        return res.status(403).json({ message: "لا يمكن حذف هذا المستخدم" });
      }
      
      await storage.deleteUser(req.params.userId);
      res.json({ success: true, message: "تم حذف المعلم بنجاح" });
    } catch (error) {
      console.error("Error deleting teacher:", error);
      res.status(500).json({ message: "حدث خطأ أثناء حذف المعلم" });
    }
  });

  // Principal/Creator: Change teacher password
  app.patch("/api/principal/teachers/:userId/password", isAuthenticated, isPrincipal, async (req, res) => {
    try {
      const { password } = req.body;
      
      if (!password || password.length < 4) {
        return res.status(400).json({ message: "كلمة المرور يجب أن تكون 4 أحرف على الأقل" });
      }
      
      const targetUser = await storage.getUser(req.params.userId);
      
      if (!targetUser) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      // Only allow changing password for teachers
      if (targetUser.role !== "teacher") {
        return res.status(403).json({ message: "لا يمكن تغيير كلمة مرور هذا المستخدم" });
      }
      
      const updated = await storage.updateUserPassword(req.params.userId, password);
      res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تغيير كلمة المرور" });
    }
  });

  // Creator: Delete any user (including admins)
  app.delete("/api/creator/users/:userId", isAuthenticated, isCreator, async (req, res) => {
    try {
      const currentUserId = await getUserIdFromRequest(req);
      
      // Cannot delete yourself
      if (req.params.userId === currentUserId) {
        return res.status(403).json({ message: "لا يمكنك حذف حسابك الخاص" });
      }
      
      const targetUser = await storage.getUser(req.params.userId);
      
      if (!targetUser) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      await storage.deleteUser(req.params.userId);
      res.json({ success: true, message: "تم حذف المستخدم بنجاح" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "حدث خطأ أثناء حذف المستخدم" });
    }
  });

  // Creator: Change any user password
  app.patch("/api/creator/users/:userId/password", isAuthenticated, isCreator, async (req, res) => {
    try {
      const { password } = req.body;
      
      if (!password || password.length < 4) {
        return res.status(400).json({ message: "كلمة المرور يجب أن تكون 4 أحرف على الأقل" });
      }
      
      const targetUser = await storage.getUser(req.params.userId);
      
      if (!targetUser) {
        return res.status(404).json({ message: "المستخدم غير موجود" });
      }
      
      const updated = await storage.updateUserPassword(req.params.userId, password);
      res.json({ success: true, message: "تم تغيير كلمة المرور بنجاح" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "حدث خطأ أثناء تغيير كلمة المرور" });
    }
  });

  return createServer(app);
}
