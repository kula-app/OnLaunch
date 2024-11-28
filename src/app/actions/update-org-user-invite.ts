export const updateOrgUserInvite = async () => {
  if (user.role === "USER") {
    logger.error(
      `You are not allowed to update user invite with email '${req.query.userEmail}' in organisation with id '${req.query.orgId}'`,
    );
    return res.status(StatusCodes.FORBIDDEN).json({
      message: `You are not allowed to update user invite with email ${req.body.userEmail} in organisation with id ${req.query.orgId}`,
    });
  }

  if (user.email === req.body.userEmail) {
    logger.error("You cannot change your own role");
    return res
      .status(StatusCodes.BAD_REQUEST)
      .json({ message: "You cannot change your own role" });
  }

  try {
    logger.log(
      `Updating role of user invite with email '${req.body.userEmail}' in organisation with id '${req.query.orgId}'`,
    );
    const updatedInvite = await prisma.userInvitationToken.updateMany({
      where: {
        invitedEmail: req.body.userEmail as string,
        orgId: Number(req.query.orgId),
        isObsolete: false,
        isArchived: false,
      },
      data: {
        role: req.body.role,
      },
    });

    return res.status(StatusCodes.CREATED).json(updatedInvite);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      logger.error(
        `No user invite with email '${req.body.userEmail}' found in organisation with id '${req.query.orgId}'`,
      );
      return res.status(StatusCodes.NOT_FOUND).json({
        message:
          "No user with email " +
          req.body.userEmail +
          " found in organisation with id " +
          req.query.orgId,
      });
    }

    logger.error(`Error: ${e}`);
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json("An internal server error occurred, please try again later");
  }
};
