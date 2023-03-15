/**
 * @file pages / api / user / setup.ts
 */

import { NextApiRequest, NextApiResponse } from "next";
import prisma from '@lib/prismadb';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]";
import { LettersAndSpacesOnly } from "@lib/regex";
import { randomUUID } from "crypto";

export type UserSetupPostBody = {
  name: string;
  changeKey: boolean;
};

export type UserSetupResponse = {
  error?: string;
};

const Handler = async (
  req: NextApiRequest, 
  res: NextApiResponse<UserSetupResponse>
) => {
  if (req.method != 'POST') {
    return res.status(405).json({ error: "This method is not allowed." });
  }

  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: "You are not logged in." });
  }

  const body: UserSetupPostBody = req.body;

  if (!body.name || body.name === '') {
    return res.status(400).json({ error: "Please enter your name." });
  }

  if (LettersAndSpacesOnly.test(body.name) === false) {
    return res.status(400).json({ error: "Your name can only contain letters and spaces." });
  }

  try {
    let apiKey = '';

    if (body.changeKey === true) {
      apiKey = Buffer.from(randomUUID()).toString('base64');
    } else {
      const existingUser = await prisma.user.findUnique({
        select: { apiKey: true },
        where: { id: session.user.id }
      });
      if (!existingUser) {
        throw new Error("User unexpectedly non-existent!");
      }

      if (existingUser.apiKey) {
        apiKey = existingUser.apiKey;
      } else {
        apiKey = Buffer.from(randomUUID()).toString('base64');
      }
    }

    await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        name: body.name,
        apiKey
      }
    });

    return res.status(200).json({});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Something went wrong. Try again later." });
  }
}

export default Handler;
