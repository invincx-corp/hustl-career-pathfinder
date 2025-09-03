import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, 
  Target, 
  BookOpen, 
  Clock, 
  ArrowRight,
  TrendingUp,
  CheckCircle,
  AlertTriangle
} from "lucide-react";

interface Skill {
  id: string;
  name: string;
  currentLevel: number;
  targetLevel: number;
  category: string;
  inDemand: boolean;
  courses: Course[];
}

interface Course {
  id: string;
  title: string;
  provider: string;
  duration: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  rating: number;
  price: number;
  freeAlternative?: string;
}

const mockSkills: Skill[] = [
  {
    id: "python",
    name: "Python Programming",
    currentLevel: 3,
    targetLevel: 8,
    category: "Programming",
    inDemand: true,
    courses: [
      {
        id: "1",
        title: "Advanced Python for Data Science",
        provider: "DataCamp",
        duration: "6 weeks",
        difficulty: "Intermediate",
        rating: 4.8,
        price: 49,
        freeAlternative: "Python.org Tutorial"
      },
      {
        id: "2",
        title: "Python Web Development Masterclass",
        provider: "Udemy",
        duration: "12 weeks",
        difficulty: "Intermediate",
        rating: 4.6,
        price: 89,
        freeAlternative: "Django Girls Tutorial"
      }
    ]
  },
  {
    id: "react",
    name: "React Development",
    currentLevel: 2,
    targetLevel: 7,
    category: "Frontend",
    inDemand: true,
    courses: [
      {
        id: "3",
        title: "React Complete Guide",
        provider: "Coursera",
        duration: "8 weeks",
        difficulty: "Beginner",
        rating: 4.7,
        price: 79,
        freeAlternative: "React Official Docs"
      }
    ]
  },
  {
    id: "design",
    name: "UI/UX Design",
    currentLevel: 1,
    targetLevel: 6,
    category: "Design",
    inDemand: true,
    courses: [
      {
        id: "4",
        title: "Design Thinking Fundamentals",
        provider: "IDEO",
        duration: "4 weeks",
        difficulty: "Beginner",
        rating: 4.9,
        price: 0,
        freeAlternative: "Google UX Design Course"
      }
    ]
  }
];

const SkillStacker = () => {
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  const getSkillGap = (skill: Skill) => skill.targetLevel - skill.currentLevel;
  const getProgressPercentage = (skill: Skill) => (skill.currentLevel / skill.targetLevel) * 100;

  const filteredCourses = selectedSkill?.courses.filter(course => 
    showFreeOnly ? course.price === 0 || course.freeAlternative : true
  ) || [];

  return (
    <section className="py-20 bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-medium mb-4">
            <Brain className="h-4 w-4 mr-2" />
            SkillStacker
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Bridge Your Skill Gaps
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            AI-powered analysis of your current skills vs. industry demands. 
            Get personalized course recommendations to level up fast.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {!selectedSkill ? (
            <>
              {/* Skills Overview */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {mockSkills.map((skill, index) => (
                  <Card 
                    key={skill.id} 
                    className="hover:shadow-elevation cursor-pointer transition-all duration-300 animate-slide-up"
                    style={{animationDelay: `${index * 0.1}s`}}
                    onClick={() => setSelectedSkill(skill)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{skill.name}</CardTitle>
                          <Badge variant="outline" className="mt-1">
                            {skill.category}
                          </Badge>
                        </div>
                        {skill.inDemand && (
                          <div className="flex items-center text-xs text-success">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            High Demand
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Current Level</span>
                            <span>{skill.currentLevel}/10</span>
                          </div>
                          <Progress value={getProgressPercentage(skill)} className="h-2" />
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-muted-foreground">
                            Gap: {getSkillGap(skill)} levels
                          </div>
                          <div className="text-sm font-medium">
                            Target: {skill.targetLevel}/10
                          </div>
                        </div>
                        
                        <div className="pt-2">
                          <div className="text-sm text-muted-foreground mb-2">
                            {skill.courses.length} recommended course{skill.courses.length !== 1 ? 's' : ''}
                          </div>
                          <Button variant="outline" size="sm" className="w-full">
                            View Courses
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add Custom Skill */}
              <Card className="max-w-md mx-auto">
                <CardContent className="p-6 text-center">
                  <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-lg font-semibold mb-2">Add New Skill</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Tell us what skill you want to develop and we'll create a learning path
                  </p>
                  <Button variant="hero">
                    <Brain className="h-4 w-4 mr-2" />
                    Analyze Skill Gap
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            /* Skill Detail View */
            <div className="space-y-6 animate-fade-in">
              {/* Back Button & Skill Header */}
              <div className="flex items-center justify-between">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedSkill(null)}
                  className="mb-4"
                >
                  ← Back to Skills
                </Button>
                
                <div className="flex items-center space-x-2">
                  <label className="text-sm">Show free courses only</label>
                  <input 
                    type="checkbox" 
                    checked={showFreeOnly}
                    onChange={(e) => setShowFreeOnly(e.target.checked)}
                    className="rounded"
                  />
                </div>
              </div>

              <Card className="p-6">
                <div className="grid md:grid-cols-2 gap-6 items-center">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{selectedSkill.name}</h3>
                    <Badge variant="outline" className="mb-4">{selectedSkill.category}</Badge>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span>Current Skill Level</span>
                          <span>{selectedSkill.currentLevel}/10</span>
                        </div>
                        <Progress value={getProgressPercentage(selectedSkill)} className="h-3" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-accent">{getSkillGap(selectedSkill)}</div>
                          <div className="text-sm text-muted-foreground">Levels to close</div>
                        </div>
                        <div className="p-3 bg-muted rounded-lg">
                          <div className="text-2xl font-bold text-success">{selectedSkill.targetLevel}</div>
                          <div className="text-sm text-muted-foreground">Target level</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-card p-6 rounded-lg">
                    <h4 className="font-semibold mb-3">Why this skill matters:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-success mr-2" />
                        High industry demand
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-success mr-2" />
                        Essential for your career goal
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-success mr-2" />
                        Complements your existing skills
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Course Recommendations */}
              <div>
                <h4 className="text-xl font-semibold mb-4">Recommended Learning Path</h4>
                <div className="grid gap-4">
                  {filteredCourses.map((course, index) => (
                    <Card key={course.id} className="animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-start space-x-4">
                              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                <BookOpen className="h-6 w-6 text-primary" />
                              </div>
                              
                              <div className="flex-1">
                                <h5 className="text-lg font-semibold mb-1">{course.title}</h5>
                                <p className="text-muted-foreground text-sm mb-3">by {course.provider}</p>
                                
                                <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                                  <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {course.duration}
                                  </div>
                                  <Badge variant="secondary">{course.difficulty}</Badge>
                                  <div className="flex items-center">
                                    ⭐ {course.rating}
                                  </div>
                                </div>
                                
                                {course.freeAlternative && (
                                  <div className="flex items-start space-x-2 p-3 bg-success/10 rounded-lg">
                                    <AlertTriangle className="h-4 w-4 text-success mt-0.5" />
                                    <div className="text-sm">
                                      <span className="font-medium">Free alternative: </span>
                                      <span className="text-success">{course.freeAlternative}</span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right ml-4">
                            <div className="text-2xl font-bold mb-2">
                              {course.price === 0 ? 'Free' : `$${course.price}`}
                            </div>
                            <Button variant={course.price === 0 ? "success" : "hero"} size="sm">
                              {course.price === 0 ? 'Start Free' : 'Enroll Now'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SkillStacker;