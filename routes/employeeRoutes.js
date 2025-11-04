// const express = require("express");
// const { Op } = require("sequelize");
// const router = express.Router();
// const bcrypt = require('bcryptjs'); // Must be installed: npm install bcryptjs

// module.exports = (models, sequelize, requireLogin) => {
//   const { EmployeeMaster } = models;

//   // Create Employee
//   router.post("/", requireLogin, async (req, res) => {
//     try {
//       const lastEmployee = await EmployeeMaster.findOne({
//         order: [[sequelize.literal("CAST(SUBSTRING(employeeid, 5) AS INTEGER)"), "DESC"]],
//         limit: 1,
//         where: { employeeid: { [Op.like]: "EMP_%" } },
//       });

//       let newEmployeeNumber = 1;
//       if (lastEmployee) {
//         const lastId = lastEmployee.employeeid;
//         const lastNumber = parseInt(lastId.split("_")[1], 10);
//         newEmployeeNumber = lastNumber + 1;
//       }

//       const newEmployeeID = `EMP_${newEmployeeNumber}`;
      
//       // CRITICAL SECURITY STEP: Hash the password before saving
//       const hashedPassword = await bcrypt.hash(req.body.password, 10);

//       const employee = await EmployeeMaster.create({
//         employeeid: newEmployeeID,
//         name: req.body.name,
//         email: req.body.email,
//         department: req.body.department,
//         role: req.body.role,
//         username: req.body.username,
//         password: hashedPassword, // Store the hash
//         reportingto: req.body.reportingTo,
//         access: req.body.access,
//       });
//       res.status(201).json(employee);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   // Get all Employees
//   router.get("/", requireLogin, async (req, res) => {
//     try {
//       const employees = await EmployeeMaster.findAll();
//       res.json(employees);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   // Get Employee by ID
//   router.get("/:id", requireLogin, async (req, res) => {
//     try {
//       const employee = await EmployeeMaster.findByPk(req.params.id);
//       if (!employee) return res.status(404).json({ error: "Employee not found" });
//       res.json(employee);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   // Update Employee by ID
//   router.put("/:id", requireLogin, async (req, res) => {
//     try {
//       const employee = await EmployeeMaster.findByPk(req.params.id);
//       if (!employee) return res.status(404).json({ error: "Employee not found" });

//       const updateData = {
//         name: req.body.name,
//         email: req.body.email,
//         department: req.body.department,
//         role: req.body.role,
//         username: req.body.username,
//         reportingto: req.body.reportingTo,
//         access: req.body.access,
//       };
      
//       // If a new password is provided, hash it before updating
//       if (req.body.password) {
//           updateData.password = await bcrypt.hash(req.body.password, 10);
//       }

//       await employee.update(updateData);
//       res.json(employee);
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   // Delete Employee by ID
//   router.delete("/:id", requireLogin, async (req, res) => {
//     try {
//       const employee = await EmployeeMaster.findByPk(req.params.id);
//       if (!employee) return res.status(404).json({ error: "Employee not found" });
//       await employee.destroy();
//       res.json({ message: "Employee deleted successfully" });
//     } catch (err) {
//       res.status(500).json({ error: err.message });
//     }
//   });

//   return router;
// };


const express = require("express");
const { Op } = require("sequelize");
const router = express.Router();
// const bcrypt = require('bcryptjs'); // Hashing library removed as requested

module.exports = (models, sequelize, requireLogin) => {
  const { EmployeeMaster } = models;

  // Create Employee
  router.post("/", requireLogin, async (req, res) => {
    try {
      const lastEmployee = await EmployeeMaster.findOne({
        order: [[sequelize.literal("CAST(SUBSTRING(employeeid, 5) AS INTEGER)"), "DESC"]],
        limit: 1,
        where: { employeeid: { [Op.like]: "EMP_%" } },
      });

      let newEmployeeNumber = 1;
      if (lastEmployee) {
        const lastId = lastEmployee.employeeid;
        const lastNumber = parseInt(lastId.split("_")[1], 10);
        newEmployeeNumber = lastNumber + 1;
      }

      const newEmployeeID = `EMP_${newEmployeeNumber}`;
      
      // Hashing logic REMOVED. Password will be stored as plaintext.
      const plainPassword = req.body.password;

      const employee = await EmployeeMaster.create({
        employeeid: newEmployeeID,
        name: req.body.name,
        email: req.body.email,
        department: req.body.department,
        role: req.body.role,
        username: req.body.username,
        password: plainPassword, // Store the plaintext password
        reportingto: req.body.reportingTo,
        access: req.body.access,
      });
      res.status(201).json(employee);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get all Employees
  router.get("/", requireLogin, async (req, res) => {
    try {
      // NOTE: For security, you should exclude the password field here, 
      // but for simplified development testing, we keep the original findAll().
      const employees = await EmployeeMaster.findAll();
      res.json(employees);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Get Employee by ID
  router.get("/:id", requireLogin, async (req, res) => {
    try {
      const employee = await EmployeeMaster.findByPk(req.params.id);
      if (!employee) return res.status(404).json({ error: "Employee not found" });
      res.json(employee);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Update Employee by ID
  router.put("/:id", requireLogin, async (req, res) => {
    try {
      const employee = await EmployeeMaster.findByPk(req.params.id);
      if (!employee) return res.status(404).json({ error: "Employee not found" });

      const updateData = {
        name: req.body.name,
        email: req.body.email,
        department: req.body.department,
        role: req.body.role,
        username: req.body.username,
        reportingto: req.body.reportingTo,
        access: req.body.access,
      };
      
      // If a new password is provided, store it as plaintext.
      // Hashing logic REMOVED.
      if (req.body.password) {
          updateData.password = req.body.password;
      }

      await employee.update(updateData);
      res.json(employee);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Delete Employee by ID
  router.delete("/:id", requireLogin, async (req, res) => {
    try {
      const employee = await EmployeeMaster.findByPk(req.params.id);
      if (!employee) return res.status(404).json({ error: "Employee not found" });
      await employee.destroy();
      res.json({ message: "Employee deleted successfully" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
