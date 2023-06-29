import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, ObjectId } from  'mongoose';
import { User } from './schemas/user.schema';
import { RegisterUserDto } from 'src/auth/dto/register-user.dto';
import { RecoverUserDto } from 'src/auth/dto/recover-user.dto';
import { RecoverRequestDto } from 'src/auth/dto/recover-request.dto';
import { Course } from '../courses/schemas/course.schema';

@Injectable()
export class UsersService {
	constructor(
		@InjectModel(User.name) private userModel: Model<User>,
	) { }

	async create(user: RegisterUserDto) {
		try{
			const result = await this.userModel.find({ email: user.email });

			if(result.length !== 0){
				return { message: 'User already exists' };
			} else {
				await this.userModel.create( user );
				return { 
					message: 'User created succesfully',
					status: 200,
					data: ''
				};
			}
		}catch(error){
			throw error;
		}
	}

	async addCreatedCourse(userId: ObjectId, courseId: mongoose.Types.ObjectId) {
		try {
			await this.userModel.findOneAndUpdate({ _id: userId }, 
				{ $push: { created_courses: courseId } }
			);

			return {
				message: 'Created course added successfully',
				status: HttpStatus.OK,
				data: ''
			};
		} catch (error) {
			throw error;
		}
	}

	async findAll() {
		try{
			const users = await this.userModel.find().select('-password').lean().exec();
			return {
				message: 'All users retrieved succesfully',
				status: 200,
				users: users
			};
		}catch(error){
			throw error;
		}
	}

	async findAllAdmin() {
		try {
			const users = await this.userModel.find();
			return {
				message: 'All users retrieved succesfully',
				status: 200,
				users: users
			};
			
		} catch (error) {
			throw error;
			
		}
	}

	async findOneLogin(email:string) {
		return await this.userModel.findOne({ email });
	}

	async findOne(id : ObjectId) {
		try {
			const user = await this.userModel.findOne({ _id: id }).select('-password -recovery_token');
			return {
				message: 'User retrived successfully',
				status: 200,
				data: user
			};
		} catch (error) {
			throw error;
		}	
	}

	async findOneWithCreatedCourses(id : ObjectId) {
		try {
			const createdCourses = await this.userModel.findOne({ _id: id }).select('created_courses').populate('created_courses');
			return {
				message: 'User with created courses retrived successfully',
				status: 200,
				data: createdCourses
			};
		} catch (error) {
			throw error;
		}	
	}

	async update(user: UpdateUserDto) {
		try {
			const updatedUser = await this.userModel.findOneAndUpdate({ _id: user._id }, {
				...user
			});
			return {
				message: 'User updated successfully',
				status: 200,
				user: updatedUser
			};
		} catch (error) {
			throw error;
		}
	}

	async updatePassword(user: RecoverUserDto) {
		try {
			await this.userModel.findOneAndUpdate({ _id: user._id }, {
				...user
			}).select('-password -recovery_token');
			return {
				message: 'Password updated successfully',
				status: 200,
				user: ''
			};
		} catch (error) {
			throw error;
		}
	}

	async updateRecoveryToken(user: RecoverRequestDto) {
		try {
			const userTokenCreated = await this.userModel.findOneAndUpdate({ _id: user._id }, {
				...user
			});
			return {
				message: 'Recovery token created successfully',
				status: 200,
				user: userTokenCreated
			};
		} catch (error) {
			throw error;
		}
	}

	async findAllBoughtCourses( user, filter ) {
		try {
			const usersBoughtCourses = await this.userModel.find( user, filter ).lean().exec();		
			return {
				message: 'All users retrieved succesfully',
				status: 200,
				data: usersBoughtCourses
			}; 	
		} catch (error) {
			throw error;
		}
	}

	async deleteUserByAdmin(id: ObjectId) {
		try {
			const findUser = await this.userModel.findByIdAndDelete( id );
			if (!findUser) throw new HttpException('User not found', HttpStatus.NOT_FOUND)
			return {
				message: 'User deleted by Admin',
				status: HttpStatus.OK,
				data: ''
			};
		} catch (error) {
			throw error;
		}
	}
}
