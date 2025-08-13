import { Router } from 'express'
import { prisma } from '../prisma'

const router = Router()

// GET /mentors?subject=math&limit=10 OR /mentors?query=math&subjects=math,physics&minRating=4&availableNow=true
router.get('/', async (req, res) => {
  const {
    subject = '',
    query = '',
    subjects = '',
    minRating = '1',
    availableNow = 'false',
    limit = '10'
  } = req.query

  const limitNum = Math.min(Number(limit) || 10, 50)

  try {
    // If search parameters are provided, use advanced search
    if (query || subjects || minRating !== '1' || availableNow === 'true') {
      // Parse search parameters
      const searchQuery = String(query || '').toLowerCase().trim()
      const subjectList = subjects ? String(subjects).split(',').map(s => s.trim()).filter(Boolean) : []
      const minRatingNum = Math.max(1, Math.min(5, Number(minRating) || 1))
      const availableNowBool = availableNow === 'true'

      // Build where conditions for search
      const whereConditions: any = {
        role: 'MENTOR' as any,
      }

      // Add profile conditions
      const profileConditions: any = {}

      // Rating filter
      if (minRatingNum > 1) {
        profileConditions.rating = {
          gte: minRatingNum,
        }
      }

      // Availability filter
      if (availableNowBool) {
        profileConditions.isNotNull = true
      }

      // Query filter (search in name or subjects)
      if (searchQuery) {
        whereConditions.OR = [
          {
            name: {
              contains: searchQuery,
              mode: 'insensitive',
            },
          },
          {
            profile: {
              subjects: {
                contains: searchQuery,
                mode: 'insensitive',
              },
            },
          },
        ]
      }

      // Subject filter - search for mentors who have any of the selected subjects
      if (subjectList.length > 0) {
        // Use OR condition to find mentors who have any of the selected subjects
        const subjectConditions = subjectList.map(subject => ({
          profile: {
            subjects: {
              contains: subject,
              mode: 'insensitive',
            },
          },
        }))
        
        if (whereConditions.OR) {
          // If we already have OR conditions, we need to combine them properly
          whereConditions.AND = [
            { OR: whereConditions.OR },
            { OR: subjectConditions }
          ]
          delete whereConditions.OR
        } else {
          whereConditions.OR = subjectConditions
        }
      }

      // Add profile conditions if any
      if (Object.keys(profileConditions).length > 0) {
        whereConditions.profile = profileConditions
      }

      console.log('Search query:', { searchQuery, subjectList, minRatingNum, availableNowBool, limitNum })
      console.log('Where conditions:', JSON.stringify(whereConditions, null, 2))

      const mentors = await prisma.user.findMany({
        where: whereConditions,
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          profile: { 
            select: { 
              subjects: true, 
              rating: true, 
              hourlyRate: true, 
              successRate: true, 
              aiScore: true,
              availability: true
            } 
          },
        },
        take: limitNum,
        orderBy: [
          { profile: { aiScore: 'desc' } },
          { profile: { rating: 'desc' } },
          { name: 'asc' }
        ],
      })

      console.log(`Found ${mentors.length} mentors`)

      // Transform the data to match frontend expectations
      const transformedMentors = mentors.map(mentor => ({
        id: mentor.id,
        name: mentor.name,
        email: mentor.email,
        avatarUrl: mentor.avatarUrl,
        subjects: mentor.profile?.subjects || [],
        rating: mentor.profile?.rating || 0,
        hourlyRate: mentor.profile?.hourlyRate || 0,
        successRate: mentor.profile?.successRate || 0,
        aiScore: mentor.profile?.aiScore || 0,
        description: '', // Default empty description since it's not in the model
        availability: mentor.profile?.availability || false,
      }))

      return res.json({ 
        mentors: transformedMentors,
        total: transformedMentors.length,
        filters: {
          query: searchQuery,
          subjects: subjectList,
          minRating: minRatingNum,
          availableNow: availableNowBool
        }
      })
    } else {
      // Simple subject-based search (original functionality)
      const subjectQuery = String(subject || '').toLowerCase()

      const mentors = await prisma.user.findMany({
        where: {
          role: 'MENTOR' as any,
          profile: subjectQuery
            ? {
                subjects: {
                  contains: subjectQuery,
                  mode: 'insensitive',
                },
              }
            : undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          profile: { select: { subjects: true, rating: true, hourlyRate: true, successRate: true, aiScore: true } },
        },
        take: limitNum,
        orderBy: { id: 'desc' },
      })

      return res.json({ mentors })
    }
  } catch (e: any) {
    console.error('GET /mentors failed', e)
    return res.status(500).json({ error: 'Failed to fetch mentors' })
  }
})

export default router


