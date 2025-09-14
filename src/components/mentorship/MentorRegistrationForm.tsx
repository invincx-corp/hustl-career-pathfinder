// Mentor Registration Form Component
// Allows users to register as mentors

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Briefcase,
  Clock,
  DollarSign,
  Languages,
  Award,
  GraduationCap,
  Upload,
  Plus,
  X,
  CheckCircle
} from 'lucide-react';
import { mentorProfileManager } from '@/lib/mentor-profile-manager';
import { useAuth } from '@/hooks/useAuth';

interface MentorRegistrationFormProps {
  onSuccess?: (mentorId: string) => void;
  onCancel?: () => void;
}

export const MentorRegistrationForm: React.FC<MentorRegistrationFormProps> = ({
  onSuccess,
  onCancel
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: user?.email || '',
      phone: '',
      location: '',
      timezone: 'UTC',
      bio: '',
      profileImage: ''
    },
    professionalInfo: {
      currentRole: '',
      company: '',
      industry: '',
      yearsOfExperience: 0,
      specializations: [] as string[],
      skills: [] as string[],
      certifications: [] as Array<{
        name: string;
        issuer: string;
        date: string;
        credentialId: string;
      }>,
      education: [] as Array<{
        degree: string;
        field: string;
        institution: string;
        graduationYear: number;
      }>
    },
    mentoringInfo: {
      areasOfExpertise: [] as string[],
      mentoringStyle: '',
      experienceLevel: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
      availability: {
        timeSlots: [] as Array<{
          day: string;
          startTime: string;
          endTime: string;
          timezone: string;
        }>,
        maxSessionsPerWeek: 5,
        sessionDuration: 60
      },
      pricing: {
        hourlyRate: 0,
        currency: 'USD',
        freeSessions: 2
      },
      languages: ['English'],
      communicationPreferences: [] as string[]
    },
    preferences: {
      menteeTypes: [] as string[],
      sessionTypes: ['video', 'phone'],
      maxMentees: 10,
      autoAccept: false,
      notificationSettings: {
        email: true,
        sms: false,
        push: true
      }
    }
  });

  const [newSkill, setNewSkill] = useState('');
  const [newSpecialization, setNewSpecialization] = useState('');
  const [newAreaOfExpertise, setNewAreaOfExpertise] = useState('');
  const [newCertification, setNewCertification] = useState({
    name: '',
    issuer: '',
    date: '',
    credentialId: ''
  });
  const [newEducation, setNewEducation] = useState({
    degree: '',
    field: '',
    institution: '',
    graduationYear: new Date().getFullYear()
  });
  const [newTimeSlot, setNewTimeSlot] = useState({
    day: '',
    startTime: '',
    endTime: '',
    timezone: 'UTC'
  });

  const handleInputChange = (section: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section: string, subsection: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [subsection]: {
          ...(prev[section as keyof typeof prev] as any)[subsection],
          [field]: value
        }
      }
    }));
  };

  const addToList = (section: string, field: string, value: string) => {
    if (!value.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: [
          ...(prev[section as keyof typeof prev] as any)[field],
          value.trim()
        ]
      }
    }));
  };

  const removeFromList = (section: string, field: string, index: number) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: (prev[section as keyof typeof prev] as any)[field].filter((_: any, i: number) => i !== index)
      }
    }));
  };

  const addCertification = () => {
    if (!newCertification.name || !newCertification.issuer) return;
    
    setFormData(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        certifications: [...prev.professionalInfo.certifications, { ...newCertification }]
      }
    }));
    
    setNewCertification({ name: '', issuer: '', date: '', credentialId: '' });
  };

  const addEducation = () => {
    if (!newEducation.degree || !newEducation.institution) return;
    
    setFormData(prev => ({
      ...prev,
      professionalInfo: {
        ...prev.professionalInfo,
        education: [...prev.professionalInfo.education, { ...newEducation }]
      }
    }));
    
    setNewEducation({ degree: '', field: '', institution: '', graduationYear: new Date().getFullYear() });
  };

  const addTimeSlot = () => {
    if (!newTimeSlot.day || !newTimeSlot.startTime || !newTimeSlot.endTime) return;
    
    setFormData(prev => ({
      ...prev,
      mentoringInfo: {
        ...prev.mentoringInfo,
        availability: {
          ...prev.mentoringInfo.availability,
          timeSlots: [...prev.mentoringInfo.availability.timeSlots, { ...newTimeSlot }]
        }
      }
    }));
    
    setNewTimeSlot({ day: '', startTime: '', endTime: '', timezone: 'UTC' });
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    setIsSubmitting(true);
    
    try {
      const mentorProfile = mentorProfileManager.createMentorProfile(user.id, formData);
      console.log('Mentor profile created:', mentorProfile);
      
      if (onSuccess) {
        onSuccess(mentorProfile.id);
      }
    } catch (error) {
      console.error('Failed to create mentor profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.personalInfo.firstName && 
               formData.personalInfo.lastName && 
               formData.personalInfo.email && 
               formData.personalInfo.location;
      case 2:
        return formData.professionalInfo.currentRole && 
               formData.professionalInfo.company && 
               formData.professionalInfo.industry &&
               formData.professionalInfo.skills.length > 0;
      case 3:
        return formData.mentoringInfo.areasOfExpertise.length > 0 &&
               formData.mentoringInfo.availability.timeSlots.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">Become a Mentor</CardTitle>
          <p className="text-center text-gray-600">
            Share your expertise and help others grow in their careers
          </p>
        </CardHeader>
        <CardContent>
          {/* Progress Indicator */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
                  </div>
                  {step < 4 && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <Tabs value={currentStep.toString()} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="1">Personal</TabsTrigger>
              <TabsTrigger value="2">Professional</TabsTrigger>
              <TabsTrigger value="3">Mentoring</TabsTrigger>
              <TabsTrigger value="4">Preferences</TabsTrigger>
            </TabsList>

            {/* Step 1: Personal Information */}
            <TabsContent value="1" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.personalInfo.firstName}
                    onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                    placeholder="Enter your first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.personalInfo.lastName}
                    onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                    placeholder="Enter your last name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.personalInfo.email}
                    onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.personalInfo.phone}
                    onChange={(e) => handleInputChange('personalInfo', 'phone', e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.personalInfo.location}
                    onChange={(e) => handleInputChange('personalInfo', 'location', e.target.value)}
                    placeholder="City, Country"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={formData.personalInfo.timezone}
                    onValueChange={(value) => handleInputChange('personalInfo', 'timezone', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="GMT">GMT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="bio">Bio *</Label>
                <Textarea
                  id="bio"
                  value={formData.personalInfo.bio}
                  onChange={(e) => handleInputChange('personalInfo', 'bio', e.target.value)}
                  placeholder="Tell us about yourself and your background..."
                  rows={4}
                />
              </div>
            </TabsContent>

            {/* Step 2: Professional Information */}
            <TabsContent value="2" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="currentRole">Current Role *</Label>
                  <Input
                    id="currentRole"
                    value={formData.professionalInfo.currentRole}
                    onChange={(e) => handleInputChange('professionalInfo', 'currentRole', e.target.value)}
                    placeholder="e.g., Senior Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={formData.professionalInfo.company}
                    onChange={(e) => handleInputChange('professionalInfo', 'company', e.target.value)}
                    placeholder="e.g., Google, Microsoft"
                  />
                </div>
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Select
                    value={formData.professionalInfo.industry}
                    onValueChange={(value) => handleInputChange('professionalInfo', 'industry', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="yearsOfExperience">Years of Experience *</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    value={formData.professionalInfo.yearsOfExperience}
                    onChange={(e) => handleInputChange('professionalInfo', 'yearsOfExperience', parseInt(e.target.value) || 0)}
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Skills */}
              <div>
                <Label>Skills *</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    onKeyPress={(e) => e.key === 'Enter' && addToList('professionalInfo', 'skills', newSkill)}
                  />
                  <Button
                    type="button"
                    onClick={() => addToList('professionalInfo', 'skills', newSkill)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.professionalInfo.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeFromList('professionalInfo', 'skills', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Specializations */}
              <div>
                <Label>Specializations</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    placeholder="Add a specialization"
                    onKeyPress={(e) => e.key === 'Enter' && addToList('professionalInfo', 'specializations', newSpecialization)}
                  />
                  <Button
                    type="button"
                    onClick={() => addToList('professionalInfo', 'specializations', newSpecialization)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.professionalInfo.specializations.map((spec, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {spec}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeFromList('professionalInfo', 'specializations', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Step 3: Mentoring Information */}
            <TabsContent value="3" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="experienceLevel">Mentoring Experience Level *</Label>
                  <Select
                    value={formData.mentoringInfo.experienceLevel}
                    onValueChange={(value) => handleInputChange('mentoringInfo', 'experienceLevel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                      <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                      <SelectItem value="advanced">Advanced (3-5 years)</SelectItem>
                      <SelectItem value="expert">Expert (5+ years)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="hourlyRate">Hourly Rate *</Label>
                  <div className="flex gap-2">
                    <DollarSign className="h-4 w-4 mt-3 text-gray-400" />
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={formData.mentoringInfo.pricing.hourlyRate}
                      onChange={(e) => handleNestedInputChange('mentoringInfo', 'pricing', 'hourlyRate', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <Select
                      value={formData.mentoringInfo.pricing.currency}
                      onValueChange={(value) => handleNestedInputChange('mentoringInfo', 'pricing', 'currency', value)}
                    >
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Areas of Expertise */}
              <div>
                <Label>Areas of Expertise *</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newAreaOfExpertise}
                    onChange={(e) => setNewAreaOfExpertise(e.target.value)}
                    placeholder="Add an area of expertise"
                    onKeyPress={(e) => e.key === 'Enter' && addToList('mentoringInfo', 'areasOfExpertise', newAreaOfExpertise)}
                  />
                  <Button
                    type="button"
                    onClick={() => addToList('mentoringInfo', 'areasOfExpertise', newAreaOfExpertise)}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.mentoringInfo.areasOfExpertise.map((area, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {area}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => removeFromList('mentoringInfo', 'areasOfExpertise', index)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <Label>Availability *</Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-2">
                  <Select
                    value={newTimeSlot.day}
                    onValueChange={(value) => setNewTimeSlot(prev => ({ ...prev, day: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monday">Monday</SelectItem>
                      <SelectItem value="Tuesday">Tuesday</SelectItem>
                      <SelectItem value="Wednesday">Wednesday</SelectItem>
                      <SelectItem value="Thursday">Thursday</SelectItem>
                      <SelectItem value="Friday">Friday</SelectItem>
                      <SelectItem value="Saturday">Saturday</SelectItem>
                      <SelectItem value="Sunday">Sunday</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="time"
                    value={newTimeSlot.startTime}
                    onChange={(e) => setNewTimeSlot(prev => ({ ...prev, startTime: e.target.value }))}
                    placeholder="Start time"
                  />
                  <Input
                    type="time"
                    value={newTimeSlot.endTime}
                    onChange={(e) => setNewTimeSlot(prev => ({ ...prev, endTime: e.target.value }))}
                    placeholder="End time"
                  />
                  <Button
                    type="button"
                    onClick={addTimeSlot}
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-2">
                  {formData.mentoringInfo.availability.timeSlots.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">
                        {slot.day} {slot.startTime} - {slot.endTime}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newSlots = formData.mentoringInfo.availability.timeSlots.filter((_, i) => i !== index);
                          handleNestedInputChange('mentoringInfo', 'availability', 'timeSlots', newSlots);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Step 4: Preferences */}
            <TabsContent value="4" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="maxMentees">Max Mentees</Label>
                  <Input
                    id="maxMentees"
                    type="number"
                    value={formData.preferences.maxMentees}
                    onChange={(e) => handleInputChange('preferences', 'maxMentees', parseInt(e.target.value) || 0)}
                    placeholder="10"
                  />
                </div>
                <div>
                  <Label htmlFor="maxSessionsPerWeek">Max Sessions per Week</Label>
                  <Input
                    id="maxSessionsPerWeek"
                    type="number"
                    value={formData.mentoringInfo.availability.maxSessionsPerWeek}
                    onChange={(e) => handleNestedInputChange('mentoringInfo', 'availability', 'maxSessionsPerWeek', parseInt(e.target.value) || 0)}
                    placeholder="5"
                  />
                </div>
              </div>

              <div>
                <Label>Session Types</Label>
                <div className="space-y-2">
                  {['video', 'phone', 'in-person', 'chat'].map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={type}
                        checked={formData.preferences.sessionTypes.includes(type)}
                        onCheckedChange={(checked) => {
                          const currentTypes = formData.preferences.sessionTypes;
                          const newTypes = checked
                            ? [...currentTypes, type]
                            : currentTypes.filter(t => t !== type);
                          handleInputChange('preferences', 'sessionTypes', newTypes);
                        }}
                      />
                      <label htmlFor={type} className="text-sm capitalize">
                        {type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Notification Settings</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email"
                      checked={formData.preferences.notificationSettings.email}
                      onCheckedChange={(checked) => handleNestedInputChange('preferences', 'notificationSettings', 'email', checked)}
                    />
                    <label htmlFor="email" className="text-sm">Email notifications</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sms"
                      checked={formData.preferences.notificationSettings.sms}
                      onCheckedChange={(checked) => handleNestedInputChange('preferences', 'notificationSettings', 'sms', checked)}
                    />
                    <label htmlFor="sms" className="text-sm">SMS notifications</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="push"
                      checked={formData.preferences.notificationSettings.push}
                      onCheckedChange={(checked) => handleNestedInputChange('preferences', 'notificationSettings', 'push', checked)}
                    />
                    <label htmlFor="push" className="text-sm">Push notifications</label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6">
            <div>
              {currentStep > 1 && (
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              {currentStep < 4 ? (
                <Button
                  onClick={nextStep}
                  disabled={!isStepValid(currentStep)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid(currentStep) || isSubmitting}
                >
                  {isSubmitting ? 'Creating Profile...' : 'Create Mentor Profile'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
