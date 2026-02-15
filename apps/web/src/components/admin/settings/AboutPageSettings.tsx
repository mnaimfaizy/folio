import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Plus, Trash2, BookOpen } from 'lucide-react';
import { SiteSettings, TeamMember, Program } from '@/services/adminService';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AboutPageSettingsProps {
  settings: SiteSettings;
  onUpdate: (updates: Partial<SiteSettings>) => Promise<void>;
  saving: boolean;
}

const iconOptions = [
  'BookOpen',
  'Globe',
  'GraduationCap',
  'Users',
  'Award',
  'Clock',
];

const bgColorOptions = [
  'bg-blue-500',
  'bg-green-500',
  'bg-amber-500',
  'bg-purple-500',
  'bg-red-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-cyan-500',
];

export function AboutPageSettings({
  settings,
  onUpdate,
  saving,
}: AboutPageSettingsProps) {
  const [formData, setFormData] = useState({
    // Library Stats
    about_books_collection: settings.about_books_collection || '50,000+',
    about_active_members: settings.about_active_members || '12,000+',
    about_years_service: settings.about_years_service || '30+',
    about_community_awards: settings.about_community_awards || '15',
    // Mission & Vision
    about_mission_text:
      settings.about_mission_text ||
      'To inspire, educate, and empower our community by providing equal access to knowledge, fostering a love of reading, and promoting lifelong learning through high-quality resources and innovative services.',
    about_vision_text:
      settings.about_vision_text ||
      'To be a vibrant hub where knowledge, creativity, and community thrive, offering accessible services that evolve with technological advancements while preserving the joy of reading and discovery.',
    // History
    about_history_text: settings.about_history_text || '',
    // Team & Programs
    about_team_members: settings.about_team_members || [],
    about_programs: settings.about_programs || [],
  });

  // Update form data when settings change
  useEffect(() => {
    setFormData({
      about_books_collection: settings.about_books_collection || '50,000+',
      about_active_members: settings.about_active_members || '12,000+',
      about_years_service: settings.about_years_service || '30+',
      about_community_awards: settings.about_community_awards || '15',
      about_mission_text:
        settings.about_mission_text ||
        'To inspire, educate, and empower our community by providing equal access to knowledge, fostering a love of reading, and promoting lifelong learning through high-quality resources and innovative services.',
      about_vision_text:
        settings.about_vision_text ||
        'To be a vibrant hub where knowledge, creativity, and community thrive, offering accessible services that evolve with technological advancements while preserving the joy of reading and discovery.',
      about_history_text: settings.about_history_text || '',
      about_team_members: settings.about_team_members || [],
      about_programs: settings.about_programs || [],
    });
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
  };

  // Team Member handlers
  const addTeamMember = () => {
    setFormData({
      ...formData,
      about_team_members: [
        ...formData.about_team_members,
        {
          name: '',
          role: '',
          initials: '',
          bgColor: 'bg-blue-500',
          description: '',
        },
      ],
    });
  };

  const updateTeamMember = (
    index: number,
    field: keyof TeamMember,
    value: string,
  ) => {
    const updated = [...formData.about_team_members];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, about_team_members: updated });
  };

  const removeTeamMember = (index: number) => {
    setFormData({
      ...formData,
      about_team_members: formData.about_team_members.filter(
        (_, i) => i !== index,
      ),
    });
  };

  // Program handlers
  const addProgram = () => {
    setFormData({
      ...formData,
      about_programs: [
        ...formData.about_programs,
        {
          title: '',
          icon: 'BookOpen',
          description: '',
        },
      ],
    });
  };

  const updateProgram = (
    index: number,
    field: keyof Program,
    value: string,
  ) => {
    const updated = [...formData.about_programs];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, about_programs: updated });
  };

  const removeProgram = (index: number) => {
    setFormData({
      ...formData,
      about_programs: formData.about_programs.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Library Statistics */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Library Statistics</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          These numbers appear in the "Library by the Numbers" section
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="about_books_collection">Books in Collection</Label>
            <Input
              id="about_books_collection"
              value={formData.about_books_collection}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  about_books_collection: e.target.value,
                })
              }
              placeholder="50,000+"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="about_active_members">Active Members</Label>
            <Input
              id="about_active_members"
              value={formData.about_active_members}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  about_active_members: e.target.value,
                })
              }
              placeholder="12,000+"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="about_years_service">Years of Service</Label>
            <Input
              id="about_years_service"
              value={formData.about_years_service}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  about_years_service: e.target.value,
                })
              }
              placeholder="30+"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="about_community_awards">Community Awards</Label>
            <Input
              id="about_community_awards"
              value={formData.about_community_awards}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  about_community_awards: e.target.value,
                })
              }
              placeholder="15"
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Mission & Vision */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Mission & Vision</h3>

        <div className="space-y-2">
          <Label htmlFor="about_mission_text">Mission Statement</Label>
          <Textarea
            id="about_mission_text"
            value={formData.about_mission_text}
            onChange={(e) =>
              setFormData({ ...formData, about_mission_text: e.target.value })
            }
            placeholder="Your library's mission statement"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="about_vision_text">Vision Statement</Label>
          <Textarea
            id="about_vision_text"
            value={formData.about_vision_text}
            onChange={(e) =>
              setFormData({ ...formData, about_vision_text: e.target.value })
            }
            placeholder="Your library's vision statement"
            rows={4}
          />
        </div>
      </div>

      <Separator />

      {/* History */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Library History</h3>
        <p className="text-sm text-muted-foreground">
          Use double line breaks (Enter twice) to create separate paragraphs
        </p>
        <div className="space-y-2">
          <Label htmlFor="about_history_text">History Text</Label>
          <Textarea
            id="about_history_text"
            value={formData.about_history_text}
            onChange={(e) =>
              setFormData({ ...formData, about_history_text: e.target.value })
            }
            placeholder="Your library's history..."
            rows={8}
          />
        </div>
      </div>

      <Separator />

      {/* Team Members */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Team Members</h3>
            <p className="text-sm text-muted-foreground">
              Add your library team members
            </p>
          </div>
          <Button
            type="button"
            onClick={addTeamMember}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        <div className="space-y-4">
          {formData.about_team_members.map((member, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Team Member {index + 1}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTeamMember(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={member.name}
                      onChange={(e) =>
                        updateTeamMember(index, 'name', e.target.value)
                      }
                      placeholder="Sarah Johnson"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Input
                      value={member.role}
                      onChange={(e) =>
                        updateTeamMember(index, 'role', e.target.value)
                      }
                      placeholder="Head Librarian"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Initials</Label>
                    <Input
                      value={member.initials}
                      onChange={(e) =>
                        updateTeamMember(index, 'initials', e.target.value)
                      }
                      placeholder="SJ"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Background Color</Label>
                    <Select
                      value={member.bgColor}
                      onValueChange={(value) =>
                        updateTeamMember(index, 'bgColor', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {bgColorOptions.map((color) => (
                          <SelectItem key={color} value={color}>
                            <div className="flex items-center gap-2">
                              <div className={`w-4 h-4 rounded ${color}`}></div>
                              {color}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={member.description}
                    onChange={(e) =>
                      updateTeamMember(index, 'description', e.target.value)
                    }
                    placeholder="With over 15 years of experience..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Programs & Services */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Programs & Services</h3>
            <p className="text-sm text-muted-foreground">
              Add programs and services offered by your library
            </p>
          </div>
          <Button
            type="button"
            onClick={addProgram}
            variant="outline"
            size="sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Program
          </Button>
        </div>

        <div className="space-y-4">
          {formData.about_programs.map((program, index) => (
            <Card key={index}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Program {index + 1}
                  </CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeProgram(index)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={program.title}
                      onChange={(e) =>
                        updateProgram(index, 'title', e.target.value)
                      }
                      placeholder="Reading Clubs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Icon</Label>
                    <Select
                      value={program.icon}
                      onValueChange={(value) =>
                        updateProgram(index, 'icon', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {iconOptions.map((icon) => (
                          <SelectItem key={icon} value={icon}>
                            {icon}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={program.description}
                    onChange={(e) =>
                      updateProgram(index, 'description', e.target.value)
                    }
                    placeholder="Join monthly book discussions..."
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
