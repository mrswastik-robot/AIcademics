import { getAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import React from 'react'

type Props = {
  params: {
    courseid: string,
  }
}

const page = async({params: {courseid}}: Props) => {

  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/gallery");
  }

  const course = await prisma.course.findUnique({
    where: {
      id: courseid
    },
    include: {
      units:{
        include: {
          chapters: true,
        }
      }
    }
  })

  if (!course) {
    return redirect("/create");
  }

  return (
    <pre>{JSON.stringify(course,null,2)}</pre>
  )
}

export default page