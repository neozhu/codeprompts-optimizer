'use client';

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Separator} from '@/components/ui/separator';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {optimizeCodePrompt} from '@/ai/flows/optimize-code-prompt';
import {summarizeOutputDifferences} from '@/ai/flows/summarize-output-differences';
import {generateCode} from '@/ai/flows/generate-from-prompt';
import {useToast} from '@/hooks/use-toast';
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {Info} from "lucide-react";

export default function Home() {
  const [originalPrompt, setOriginalPrompt] = useState('');
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [originalOutput, setOriginalOutput] = useState('');
  const [optimizedOutput, setOptimizedOutput] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('C#');
  const {toast} = useToast();

  const samplePrompt = 'Write a function to sort an array of integers.';

  const handleOptimizePrompt = async (promptToOptimize: string) => {
    setLoading(true);
    try {
      const { optimizedPrompt } = await optimizeCodePrompt({
        originalPrompt: promptToOptimize,
        selectedLanguage,
      });
      setOptimizedPrompt(optimizedPrompt);
      toast({
        title: 'Prompt Optimized!',
        description: 'The prompt has been successfully optimized.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error optimizing prompt!',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTestPrompts = async () => {
    setLoading(true);
    try {
      // 1. Generate with original prompt
      setOriginalPrompt(samplePrompt);
      const { output: origResult } = await generateCode({
        prompt: samplePrompt,
        language: selectedLanguage,
      });
      setOriginalOutput(origResult);

      // 2. Optimize the prompt
      const { optimizedPrompt } = await optimizeCodePrompt({
        originalPrompt: samplePrompt,
        selectedLanguage,
      });
      setOptimizedPrompt(optimizedPrompt);

      // 3. Generate with optimized prompt
      const { output: optResult } = await generateCode({
        prompt: optimizedPrompt,
        language: selectedLanguage,
      });
      setOptimizedOutput(optResult);

      toast({
        title: 'Sample Tested!',
        description: 'Original and optimized outputs populated.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error testing prompts!',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompareOutputs = async () => {
    setLoading(true);
    try {
      const summaryResult = await summarizeOutputDifferences({
        originalOutput,
        optimizedOutput,
      });
      setSummary(summaryResult.summary);
      toast({
        title: 'Output Compared!',
        description: 'The outputs have been successfully compared.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error comparing outputs!',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold">CodePrompt Optimizer</h1>
        <p className="text-muted-foreground">
          Improve your coding with optimized prompts.
        </p>
      </div>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Prompt Optimization</CardTitle>
          <CardDescription>Enter your coding prompt to get an optimized version or test with a sample.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Select
            value={selectedLanguage}
            onValueChange={setSelectedLanguage}
            defaultValue="C#"
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="C#">C#</SelectItem>
              <SelectItem value="Python">Python</SelectItem>
              <SelectItem value="JavaScript">JavaScript</SelectItem>
              <SelectItem value="TypeScript">TypeScript</SelectItem>
              <SelectItem value="Java">Java</SelectItem>
              <SelectItem value="C++">C++</SelectItem>
              <SelectItem value="Go">Go</SelectItem>
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Enter your coding prompt here..."
            value={originalPrompt}
            onChange={(e) => setOriginalPrompt(e.target.value)}
          />
          <div className="flex space-x-2">
            <Button onClick={() => handleOptimizePrompt(originalPrompt)} disabled={loading || !originalPrompt}>
              {loading ? 'Optimizing...' : 'Optimize Prompt'}
            </Button>
            <Button variant="secondary" onClick={handleTestPrompts} disabled={loading}>
              {loading ? 'Testing...' : '测试'}
            </Button>
          </div>
          {optimizedPrompt && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 text-lg font-semibold">Optimized Prompt:</h3>
                <Textarea readOnly value={optimizedPrompt} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Output Comparison</CardTitle>
          <CardDescription>Compare the outputs from the original and optimized prompts.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="original">
            <TabsList className="mb-4">
              <TabsTrigger value="original">Original Prompt Output</TabsTrigger>
              <TabsTrigger value="optimized">Optimized Prompt Output</TabsTrigger>
            </TabsList>
            <TabsContent value="original">
              <Textarea
                placeholder="Enter the output from the original prompt..."
                value={originalOutput}
                onChange={(e) => setOriginalOutput(e.target.value)}
              />
            </TabsContent>
            <TabsContent value="optimized">
              <Textarea
                placeholder="Enter the output from the optimized prompt..."
                value={optimizedOutput}
                onChange={(e) => setOptimizedOutput(e.target.value)}
              />
            </TabsContent>
          </Tabs>
          <Button onClick={handleCompareOutputs} disabled={loading}>
            {loading ? 'Comparing...' : 'Compare Outputs'}
          </Button>
          {summary && (
            <>
              <Separator />
              <div>
                <h3 className="mb-2 text-lg font-semibold">Summary:</h3>
                <Textarea readOnly value={summary} />
              </div>
            </>
          )}
        </CardContent>
      </Card>
      {!originalPrompt && (
        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertTitle>使用提示</AlertTitle>
          <AlertDescription>
            请输入prompt，以优化您的代码.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
