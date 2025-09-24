import { Request } from 'express';
import { UserResponseDto } from 'src/user/dto/response-user.dto';
// import { User } from 'src/user/user.entities';

export interface RequestWithUser extends Request {
  user: UserResponseDto;
}
