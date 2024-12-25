import { v4 as uuidv4 } from 'uuid';

import workspaceRepository from '../repositories/workspaceRepository.js';
import ValidationError from '../utils/errors/validationError.js';
import { StatusCodes } from 'http-status-codes';
import ClientError from '../utils/errors/clientError.js';
import channelRepository from '../repositories/channelRepository.js';

const isUserAdminOfWorkspace = (workspace, userId) => {
  console.log(workspace.members, userId);
  const response = workspace.members.find(
    (member) =>
      (member.memberId.toString() === userId ||
        member.memberId._id.toString() === userId) &&
      member.role === 'admin'
  );
  console.log(response);
  return response;
};

export const isUserMemberOfWorkspace = (workspace, userId) => {
  console.log(userId);
  return workspace.members.find((member) => {
    console.log('member id ', member.memberId.toString());
    return member.memberId._id.toString() === userId;
  });
};

export const createworkspaceService = async (workspaceData) => {
  try {
    const joinCode = uuidv4().substring(0, 6).toUpperCase();

    const response = await workspaceRepository.create({
      name: workspaceData.name,
      description: workspaceData.description,
      joinCode
    });

    await workspaceRepository.addMemberToWorkspace(
      response._id,
      workspaceData.owner,
      'admin'
    );

    const updatedWorkspace = workspaceRepository.addChannelToWorkspace(
      response._id,
      'general'
    );
    return updatedWorkspace;
  } catch (error) {
    console.log('Create workspace service error: ', error);
    if (error.name === 'ValidationError') {
      throw new ValidationError(
        {
          error: error.errors
        },
        error.message
      );
    }
    if (error.name === 'MongoServerError' && error.code === 11000) {
      throw new ValidationError(
        {
          error: ['A workspace with same details already exists']
        },
        'A workspace with same details already exists'
      );
    }
    throw error;
  }
};

export const getWorkspacesUserIsMemberOfService = async (userId) => {
  try {
    const response =
      await workspaceRepository.fetchAllWorkspaceByMemberId(userId);
    return response;
  } catch (error) {
    console.log('Get workspaces user is member of service error', error);
    throw error;
  }
};

export const deleteWorkspaceService = async (workspaceId, userId) => {
  try {
    const workspace = await workspaceRepository.getById(workspaceId);
    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    console.log(workspace.members, userId);
    const isAllowed = isUserAdminOfWorkspace(workspace, userId);
    //   const channelIds = workspace.channels.map((channel) => channel._id);

    if (isAllowed) {
      await channelRepository.deleteMany(workspace.channels);

      const response = await workspaceRepository.delete(workspaceId);
      return response;
    }
    throw new ClientError({
      explanation: 'User is either not a memeber or an admin of the workspace',
      message: 'User is not allowed to delete the workspace',
      statusCode: StatusCodes.UNAUTHORIZED
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getWorkspaceService = async (workspaceId, userId) => {
  try {
    const workspace =
      await workspaceRepository.getWorkspaceDetailsById(workspaceId);
    if (!workspace) {
      throw new ClientError({
        explanation: 'Invalid data sent from the client',
        message: 'Workspace not found',
        statusCode: StatusCodes.NOT_FOUND
      });
    }
    console.log(workspace);
    const isMember = isUserMemberOfWorkspace(workspace, userId);
    if (!isMember) {
      throw new ClientError({
        explanation: 'User is not a member of the workspace',
        message: 'User is not a member of the workspace',
        statusCode: StatusCodes.UNAUTHORIZED
      });
    }
    return workspace;
  } catch (error) {
    console.log('Get workspace service error', error);
    throw error;
  }
};

// export const getWorkspaceByJoinCodeService = async (joinCode) => {}

// export const updateWorkspaceService = async (workspaceId, workspaceData,userId) => {}

// export const addMemberToWorkspaceService = async (workspaceId, memberId, role) => {}

// export const addChannelToWorkspaceService = async (workspaceId, channelName) => {}
