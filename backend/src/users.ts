import { Request, Response, NextFunction, RequestHandler } from 'express';
import bcrypt from 'bcryptjs';
import pool from './db.js';
import { UserRegistration } from './types.js';
import { DentistWithAvailability } from './types.js';

// managing patients
export const registerUser: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { name, email, phone, password }: UserRegistration = req.body;
    console.log('Registration attempt:', { name, email, phone });

    if (!name || !email || !password) {
      res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
      return;
    }

    console.log('Checking for existing user...');
    const [existingUsers] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if ((existingUsers as any[]).length > 0) {
      res.status(409).json({
        status: 'error',
        message: 'Email already registered'
      });
      return;
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Inserting new user...');
    
    try {
      const [result] = await pool.query(
        'INSERT INTO users (name, email, phone, password, is_admin) VALUES (?, ?, ?, ?, ?)',
        [name, email, phone || null, hashedPassword, false]
      );

      if (!result || !(result as any).insertId) {
        throw new Error('Failed to get insert ID');
      }

      const insertId = (result as any).insertId;
      console.log('Fetching new user...');
      const [users] = await pool.query('SELECT id, name, email, phone, is_admin FROM users WHERE id = ?', [insertId]);
      const newUser = (users as any[])[0];

      if (!newUser) {
        throw new Error('Failed to retrieve created user');
      }

      console.log('User registered successfully:', newUser);
      res.status(201).json({
        status: 'success',
        data: newUser,
        message: 'User registered successfully'
      });
    } catch (dbError: any) {
      console.error('Database error during registration:', dbError);
      if (dbError.code === 'ER_DUP_ENTRY') {
        res.status(409).json({
          status: 'error',
          message: 'User already exists'
        });
        return;
      }
      throw dbError;
    }
  } catch (err) {
    console.error('Registration error:', err);
    next(err);
  }
}; 


export const updateUserDetails: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    // Validate required fields
    if (!name || !email) {
      res.status(400).json({
        status: 'error',
        message: 'Name and email are required'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        status: 'error',
        message: 'Invalid email format'
      });
      return;
    }
    // Check if email already exists for another user
    const [existingUsers] = await pool.query(
      'SELECT * FROM users WHERE email = ? AND id != ?',
      [email, id]
    );

    if ((existingUsers as any[]).length > 0) {
      res.status(409).json({
        status: 'error',
        message: 'Email already registered to another user'
      });
      return;
    }

    // Update user details
    await pool.query(
      'UPDATE users SET name = ?, email = ?, phone = ? WHERE id = ?',
      [name, email, phone || null, id]
    );

    // Get updated user details
    const [users] = await pool.query(
      'SELECT id, name, email, phone, is_admin FROM users WHERE id = ?',
      [id]
    );
    const updatedUser = (users as any[])[0];

    res.json({
      status: 'success',
      data: updatedUser,
      message: 'User details updated successfully'
    });

  } catch (err) {
    console.error('Error updating user details:', err);
    res.status(500).json({
      status: 'error', 
      message: 'Internal server error'
    });
  }
};


export const addAppointment: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { patientId, dentistId, appointmentDatetime } = req.body;

    // Validate required fields
    if (!patientId || !dentistId || !appointmentDatetime) {
      res.status(400).json({
        status: 'error',
        message: 'Patient ID, dentist ID and appointment datetime are required'
      });
      return;
    }

    // Insert appointment
    const [result] = await pool.query(
      'INSERT INTO appointments (patient_id, dentist_id, appointment_datetime, status) VALUES (?, ?, ?, ?)',
      [patientId, dentistId, appointmentDatetime, 'confirmed']
    );

    const appointmentId = (result as any).insertId;

    // Get the created appointment
    const [appointments] = await pool.query(
      'SELECT * FROM appointments WHERE id = ?',
      [appointmentId]
    );
    const newAppointment = (appointments as any[])[0];

    res.status(201).json({
      status: 'success',
      data: newAppointment,
      message: 'Appointment created successfully'
    });

  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create appointment'
    });
  }
};


export const rescheduleAppointment: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { appointmentId, newAppointmentDatetime } = req.body;

    // Validate required fields
    if (!appointmentId || !newAppointmentDatetime) {
      res.status(400).json({
        status: 'error',
        message: 'Appointment ID and new appointment datetime are required'
      });
      return;
    }

    // Check if appointment exists
    const [existingAppointments] = await pool.query(
      'SELECT * FROM appointments WHERE id = ?',
      [appointmentId]
    );

    if ((existingAppointments as any[]).length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
      return;
    }

    // Update appointment
    await pool.query(
      'UPDATE appointments SET appointment_datetime = ?, status = ? WHERE id = ?',
      [newAppointmentDatetime, 'rescheduled', appointmentId]
    );

    // Get the updated appointment
    const [appointments] = await pool.query(
      'SELECT * FROM appointments WHERE id = ?',
      [appointmentId]
    );
    const updatedAppointment = (appointments as any[])[0];

    res.json({
      status: 'success',
      data: updatedAppointment,
      message: 'Appointment rescheduled successfully'
    });

  } catch (err) {
    console.error('Error rescheduling appointment:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to reschedule appointment'
    });
  }
};

export const cancelAppointment: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { appointmentId } = req.body;

    // Validate required field
    if (!appointmentId) {
      res.status(400).json({
        status: 'error',
        message: 'Appointment ID is required'
      });
      return;
    }

    // Check if appointment exists
    const [existingAppointments] = await pool.query(
      'SELECT * FROM appointments WHERE id = ?',
      [appointmentId]
    );

    if ((existingAppointments as any[]).length === 0) {
      res.status(404).json({
        status: 'error',
        message: 'Appointment not found'
      });
      return;
    }

    // Update appointment status
    await pool.query(
      'UPDATE appointments SET status = ? WHERE id = ?',
      ['cancelled', appointmentId]
    );

    // Get the updated appointment
    const [appointments] = await pool.query(
      'SELECT * FROM appointments WHERE id = ?',
      [appointmentId]
    );
    const cancelledAppointment = (appointments as any[])[0];

    res.json({
      status: 'success',
      data: cancelledAppointment,
      message: 'Appointment cancelled successfully'
    });

  } catch (err) {
    console.error('Error cancelling appointment:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cancel appointment'
    });
  }
};

export const getUserAppointments: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        status: 'error',
        message: 'User ID is required'
      });
      return;
    }

    const [appointments] = await pool.query(`
      SELECT 
        a.id,
        a.appointment_datetime as appointmentDatetime,
        a.status,
        d.name as dentist,
        d.id as dentistId
      FROM appointments a
      JOIN dentists d ON a.dentist_id = d.id 
      WHERE a.patient_id = ?
      ORDER BY a.appointment_datetime ASC
    `, [userId]);

    res.json({
      status: 'success',
      data: appointments,
      message: 'Appointments retrieved successfully'
    });

  } catch (err) {
    console.error('Error fetching user appointments:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch appointments'
    });
  }
};

export const getAllAppointments: RequestHandler = async (req, res): Promise<void> => {
  try {
    const [appointments] = await pool.query(`
      SELECT a.id, 
      a.appointment_datetime as appointmentDatetime, 
      a.status, 
      d.name as dentist, 
      d.id as dentistId,
      p.name as patient,
      p.id as patientId
      FROM appointments a
      JOIN dentists d ON a.dentist_id = d.id 
      JOIN users p ON a.patient_id = p.id
      WHERE a.status IN ('pending', 'confirmed', 'rescheduled')
    `);

    res.json({
      status: 'success',
      data: appointments,
      message: 'Appointments retrieved successfully'
    });
  } catch (err) {
    console.error('Error fetching all appointments:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch appointments'
    });
  }
}


// managing dentists
export const getDentists: RequestHandler = async (req, res): Promise<void> => {
  try {
    const [dentists] = await pool.query(`
    SELECT 
        d.id AS dentist_id,
        d.name AS dentist_name,
        av.day_of_week,
        av.start_time,
        av.end_time
    FROM 
        dentists d
    JOIN 
        availability_slots av ON d.id = av.dentist_id
    WHERE 
        -- Calculate total minutes in the availability slot (excluding last hour)
        TIME_TO_SEC(TIMEDIFF(av.end_time, av.start_time)) / 60 - 120 > (
            -- Calculate total minutes booked in appointments for this day/dentist
            SELECT COALESCE(SUM(60), 0)  -- Each appointment is 60 minutes
            FROM appointments a
            WHERE a.dentist_id = d.id
              AND a.status IN ('pending', 'confirmed', 'rescheduled')
              AND DAYNAME(a.appointment_datetime) = av.day_of_week
              AND TIME(a.appointment_datetime) BETWEEN av.start_time AND SUBTIME(av.end_time, '01:00:00')
        )
    ORDER BY 
        d.id, 
        FIELD(av.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
        av.start_time;
    `);

    // Group availability slots by dentist
    const groupedDentists = (dentists as any[]).reduce((acc: any, curr) => {
      if (!acc[curr.dentist_id]) {
        acc[curr.dentist_id] = {
          id: curr.dentist_id,
          name: curr.dentist_name,
          availability: []
        };
      }
      if (curr.day_of_week) {
        acc[curr.dentist_id].availability.push({
          dayOfWeek: curr.day_of_week,
          startTime: curr.start_time,
          endTime: curr.end_time
        });
      }
      return acc;
    }, {});

    res.json({
      status: 'success', 
      data: Object.values(groupedDentists)
    });
  } catch (err) {
    console.error('Error fetching dentists:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dentists'
    });
  }
};

export const addDentist: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { name, dayOfWeek, startTime, endTime }: DentistWithAvailability = req.body;

    if (!name || !dayOfWeek?.length || !startTime || !endTime) {
      res.status(400).json({
        status: 'error',
        message: 'Name and availability details are required'
      });
      return;
    }

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert dentist
      const [dentistResult] = await connection.query(
        'INSERT INTO dentists (name) VALUES (?)',
        [name]
      );
      const dentistId = (dentistResult as any).insertId;

      // Insert availability slots
      for (const day of dayOfWeek) {
        await connection.query(
          'INSERT INTO availability_slots (dentist_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
          [dentistId, day, startTime, endTime]
        );
      }

      await connection.commit();
      
      res.status(201).json({
        status: 'success',
        data: {
          id: dentistId,
          name,
          dayOfWeek,
          startTime,
          endTime
        }
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error adding dentist:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to add dentist'
    });
  }
};

export const deleteDentist: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { id } = req.params;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete appointments first (foreign key constraint)
      await connection.query(
        'DELETE FROM appointments WHERE dentist_id = ?',
        [id]
      );

      // Delete availability slots (foreign key constraint)
      await connection.query(
        'DELETE FROM availability_slots WHERE dentist_id = ?',
        [id]
      );

      // Delete dentist
      const [result] = await connection.query(
        'DELETE FROM dentists WHERE id = ?',
        [id]
      );

      await connection.commit();

      if ((result as any).affectedRows === 0) {
        res.status(404).json({
          status: 'error',
          message: 'Dentist not found'
        });
        return;
      }

      res.json({
        status: 'success',
        message: 'Dentist deleted successfully'
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error('Error deleting dentist:', err);
    res.status(500).json({
      status: 'error',
      message: 'Failed to delete dentist'
    });
  }
};